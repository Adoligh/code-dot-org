/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var i18n = require('./locale');
var netsimConstants = require('./netsimConstants');
var netsimUtils = require('./netsimUtils');
var NetSimNode = require('./NetSimNode');
var NetSimEntity = require('./NetSimEntity');
var NetSimLogEntry = require('./NetSimLogEntry');
var NetSimLogger = require('./NetSimLogger');
var NetSimWire = require('./NetSimWire');
var NetSimMessage = require('./NetSimMessage');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var ObservableEvent = require('../ObservableEvent');
var Packet = require('./Packet');
var dataConverters = require('./dataConverters');
var netsimNodeFactory = require('./netsimNodeFactory');

var _ = utils.getLodash();

var serializeNumber = netsimUtils.serializeNumber;
var deserializeNumber = netsimUtils.deserializeNumber;

var asciiToBinary = dataConverters.asciiToBinary;

var DnsMode = netsimConstants.DnsMode;
var NodeType = netsimConstants.NodeType;
var BITS_PER_BYTE = netsimConstants.BITS_PER_BYTE;

var logger = NetSimLogger.getSingleton();
var netsimGlobals = require('./netsimGlobals');

/**
 * @type {number}
 * @readonly
 */
var MAX_CLIENT_CONNECTIONS = 6;

/**
 * Conveniently, a router's address in its local network is always zero.
 * @type {number}
 * @readonly
 */
var ROUTER_LOCAL_ADDRESS = 0;

/**
 * Address that can only be used for the auto-dns node.
 * May eventually be replaced with a dynamically assigned address.
 * @type {number}
 * @readonly
 */
var AUTO_DNS_RESERVED_ADDRESS = 15;

/**
 * Hostname assigned to the automatic dns 'node' in the local network.
 * There will only be one of these, so it can be simple.
 * @type {string}
 * @readonly
 */
var AUTO_DNS_HOSTNAME = 'dns';

/**
 * Value the auto-DNS will return instead of an address when it can't
 * locate a node with the given hostname in the local network.
 * @type {string}
 * @readonly
 */
var AUTO_DNS_NOT_FOUND = 'NOT_FOUND';

/**
 * Maximum packet lifetime in the router queue, sort of a primitive Time-To-Live
 * system that helps prevent a queue from being indefinitely blocked by a very
 * large packet.  Packets that exceed this time will silently fail delivery.
 * @type {number}
 * @readonly
 */
var PACKET_MAX_LIFETIME_MS = 10 * 60 * 1000;

/**
 * To avoid calculating a totally unreasonable number of addresses, this is
 * the most addresses we will consider when picking one for a new host.
 * This means full support up to a 12-bit address part, which should be more
 * than enough.
 * @type {number}
 */
var ADDRESS_OPTION_LIMIT = 4096;

/**
 * Client model of simulated router
 *
 * Represents the client's view of a given router, provides methods for
 *   letting the client interact with the router, and wraps the client's
 *   work doing part of the router simulation.
 *
 * A router -exists- when it has a row in the lobby table of type 'router'
 * A router is connected to a user when a 'user' row exists in the lobby
 *   table that has a status 'Connected to {router ID} by wires {X, Y}'.
 * A router will also share a wire (simplex) or wires (duplex) with each user,
 *   which appear in the wire table.
 *
 * @param {!NetSimShard} shard
 * @param {Object} [routerRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimRouterNode = module.exports = function (shard, row) {
  row = row !== undefined ? row : {};
  NetSimNode.call(this, shard, row);

  var levelConfig = netsimGlobals.getLevelConfig();

  /**
   * Unix timestamp (local) of router creation time.
   * @type {number}
   */
  this.creationTime = utils.valueOr(row.creationTime, Date.now());

  /**
   * Sets current DNS mode for the router's local network.
   * This value is manipulated by all clients.
   * @type {DnsMode}
   * @private
   */
  this.dnsMode = utils.valueOr(row.dnsMode, levelConfig.defaultDnsMode);

  /**
   * Sets current DNS node ID for the router's local network.
   * This value is manipulated by all clients.
   * @type {number}
   * @private
   */
  this.dnsNodeID = row.dnsNodeID;

  /**
   * Speed (in bits per second) at which messages are processed.
   * @type {number}
   */
  this.bandwidth = utils.valueOr(deserializeNumber(row.bandwidth),
      levelConfig.defaultRouterBandwidth);

  /**
   * Amount of data (in bits) that the router queue can hold before it starts
   * dropping packets.
   * @type {number}
   */
  this.memory = utils.valueOr(deserializeNumber(row.memory),
      levelConfig.defaultRouterMemory);

  /**
   * Percent chance (0-1) that a packet being routed will be dropped for no
   * reason.
   * @type {number}
   */
  this.randomDropChance = utils.valueOr(row.randomDropChance,
      levelConfig.defaultRandomDropChance);

  /**
   * Determines a subset of connection and message events that this
   * router will respond to, only managing events from the given node ID,
   * to avoid conflicting with other clients also simulating this router.
   *
   * Not persisted on server.
   *
   * @type {number}
   * @private
   */
  this.simulateForSender_ = undefined;

  /**
   * Local cache of the last tick time in the local simulation.
   * Allows us to schedule/timestamp events that don't happen inside the
   * tick event.
   * @type {number}
   * @private
   */
  this.simulationTime_ = 0;

  /**
   * Packet format specification this router will use to parse, route, and log
   * packets that it receives.  Set on router that is simulated by client.
   *
   * Not persisted on server.
   *
   * @type {Packet.HeaderType[]}
   * @private
   */
  this.packetSpec_ = [];

  /**
   * If ticked, tells the network that this router is being used.
   *
   * Not persisted on server (though the heartbeat does its own persisting)
   *
   * @type {NetSimHeartbeat}
   */
  this.heartbeat = null;

  /**
   * Local cache of our remote row, used to decide whether our state has
   * changed.
   * 
   * Not persisted to server.
   * 
   * @type {Object}
   * @private
   */
  this.stateCache_ = {};
  
  /**
   * Event others can observe, which we fire when our own remote row changes.
   * 
   * @type {ObservableEvent}
   */
  this.stateChange = new ObservableEvent();

  /**
   * Event others can observe, which we fire when the router statistics
   * change (which may be very frequent...)
   *
   * @type {ObservableEvent}
   */
  this.statsChange = new ObservableEvent();

  /**
   * Local cache of wires attached to this router, used for detecting and
   * broadcasting relevant changes.
   *
   * Not persisted on server.
   *
   * @type {Array}
   * @private
   */
  this.myWireRowCache_ = [];

  /**
   * Event others can observe, which we fire when the router's set of wires
   * changes indicating a change in the local network.
   *
   * @type {ObservableEvent}
   */
  this.wiresChange = new ObservableEvent();

  /**
   * Local cache of log rows associated with this router, used for detecting
   * and broadcasting relevant changes.
   * 
   * @type {Array}
   * @private
   */
  this.myLogRowCache_ = [];
  
  /**
   * Event others can observe, which we fire when the router's log content
   * changes.
   * 
   * @type {ObservableEvent}
   */
  this.logChange = new ObservableEvent();

  /**
   * Whether router is in the middle of work.  Keeps router from picking up
   * its own change notifications or interrupting its own processes.
   * @type {boolean}
   * @private
   */
  this.isRouterProcessing_ = false;

  /**
   * Local cache of message rows that need to be processed by (any simulation
   * of) the router.  Used for tracking router memory, throughput, etc.
   * @type {messageRow[]}
   * @private
   */
  this.routerQueueCache_ = [];

  /**
   * Set of scheduled 'routing events'
   * @type {Object[]}
   * @private
   */
  this.localRoutingSchedule_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.isAutoDnsProcessing_ = false;

  /**
   * Local cache of message rows that need to be processed by (any simulation
   * of) the auto-DNS. Used for stats and limiting.
   * @type {messageRow[]}
   * @private
   */
  this.autoDnsQueue_ = [];
};
NetSimRouterNode.inherits(NetSimNode);

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimRouterNode.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimRouterNode, shard, function (err, router) {
    if (err) {
      onComplete(err, null);
      return;
    }

    NetSimHeartbeat.getOrCreate(shard, router.entityID, function (err, heartbeat) {
      if (err) {
        onComplete(err, null);
        return;
      }

      // Set router heartbeat to double normal interval, since we expect
      // at least two clients to help keep it alive.
      router.heartbeat = heartbeat;
      router.heartbeat.setBeatInterval(12000);

      onComplete(null, router);
    });
  });
};

/**
 * Static async retrieval method.  See NetSimEntity.get().
 * @param {!number} routerID - The row ID for the entity you'd like to find.
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimRouterNode.get = function (routerID, shard, onComplete) {
  NetSimEntity.get(NetSimRouterNode, routerID, shard, function (err, router) {
    if (err) {
      onComplete(err, null);
      return;
    }

    NetSimHeartbeat.getOrCreate(shard, routerID, function (err, heartbeat) {
      if (err) {
        onComplete(err, null);
        return;
      }

      // Set router heartbeat to double normal interval, since we expect
      // at least two clients to help keep it alive.
      router.heartbeat = heartbeat;
      router.heartbeat.setBeatInterval(12000);

      onComplete(null, router);
    });
  });
};

/**
 * @typedef {Object} routerRow
 * @property {number} creationTime - Unix timestamp (local)
 * @property {number} bandwidth - Router max transmission/processing rate
 *           in bits/second
 * @property {number} memory - Router max queue capacity in bits
 * @property {DnsMode} dnsMode - Current DNS mode for the local network
 * @property {number} dnsNodeID - Entity ID of the current DNS node in the
 *           local network.
 * @property {number} randomDropChance - Odds (0-1) that a packet being routed
 *           will be dropped for no reason.
 */

/**
 * Build table row for this node.
 * @returns {routerRow}
 * @private
 * @override
 */
NetSimRouterNode.prototype.buildRow = function () {
  return utils.extend(
      NetSimRouterNode.superPrototype.buildRow.call(this),
      {
        creationTime: this.creationTime,
        bandwidth: serializeNumber(this.bandwidth),
        memory: serializeNumber(this.memory),
        dnsMode: this.dnsMode,
        dnsNodeID: this.dnsNodeID,
        randomDropChance: this.randomDropChance
      }
  );
};

/**
 * Load state from remoteRow into local model, then notify anything observing
 * us that we've changed.
 * @param {routerRow} remoteRow
 * @private
 */
NetSimRouterNode.prototype.onMyStateChange_ = function (remoteRow) {
  this.creationTime = remoteRow.creationTime;
  this.bandwidth = deserializeNumber(remoteRow.bandwidth);
  this.memory = deserializeNumber(remoteRow.memory);
  this.dnsMode = remoteRow.dnsMode;
  this.dnsNodeID = remoteRow.dnsNodeID;
  this.randomDropChance = remoteRow.randomDropChance;
  this.stateChange.notifyObservers(this);
};

/**
 * Ticks heartbeat, telling the network that router is in use.
 * @param {RunLoop.Clock} clock
 */
NetSimRouterNode.prototype.tick = function (clock) {
  this.simulationTime_ = clock.time;
  if (this.heartbeat) {
    this.heartbeat.tick(clock);
  }
  this.routeOverdueMessages_(clock);
  if (this.dnsMode === DnsMode.AUTOMATIC) {
    this.tickAutoDns_(clock);
  }
};

/**
 * This name is a bit of a misnomer, but it's memorable; we actually route
 * all messages that are DUE or OVERDUE.
 * @param {RunLoop.Clock} clock
 * @private
 */
NetSimRouterNode.prototype.routeOverdueMessages_ = function (clock) {
  if (this.isRouterProcessing_) {
    return;
  }

  // Separate out messages whose scheduled time has arrived or is past.
  // Flag them so we can remove them later.
  var readyScheduleItems = [];
  var expiredScheduleItems = [];
  this.localRoutingSchedule_.forEach(function (item) {
    if (clock.time >= item.completionTime) {
      item.beingRouted = true;
      readyScheduleItems.push(item);
    } else if (clock.time >= item.expirationTime) {
      item.beingRouted = true;
      expiredScheduleItems.push(item);
    }
  });

  // If no messages are ready, we're done.
  if (readyScheduleItems.length + expiredScheduleItems.length === 0) {
    return;
  }

  var expiredMessages = expiredScheduleItems.map(function (item) {
    return new NetSimMessage(this.shard_, item.row);
  }.bind(this));

  var readyMessages = readyScheduleItems.map(function (item) {
    return new NetSimMessage(this.shard_, item.row);
  }.bind(this));

  // First, remove the expired items.  They just silently vanish
  this.isRouterProcessing_ = true;
  NetSimEntity.destroyEntities(expiredMessages, function () {

    // Next, process the messages that are ready for routing
    this.routeMessages_(readyMessages, function () {

      // Finally, remove all the schedule entries that we flagged earlier
      this.localRoutingSchedule_ = this.localRoutingSchedule_.filter(function (item) {
        return !item.beingRouted;
      });
      this.isRouterProcessing_ = false;

    }.bind(this));
  }.bind(this));
};

/**
 * Examine the queue, and add/adjust schedule entries for packets that
 * should be handled by the local simulation.  If a packet has no entry,
 * it should be added to the schedule.  If it does and we can see that its
 * scheduled completion time is too far in the future, we should move it up.
 */
NetSimRouterNode.prototype.recalculateSchedule = function () {
  // To calculate our schedule, we keep a rolling "Pessimistic completion time"
  // as we walk down the queue.  This "pessimistic time" is when the packet
  // would finish processing, assuming all of the packets ahead of it in the
  // queue must be processed first and the first packet in the queue is just
  // starting to process now.  We do this because the first packet might be
  // owned by a remote client, so we won't have partial progress information
  // on it.
  //
  // Thus, the pessimistic time is the _latest_ we would expect the router
  // to be done processing the packet given the current bandwidth setting,
  // if the router was an actual hardware device.
  //
  // The estimate is actually _optimistic_ in the sense that it doesn't wait
  // for notification that a remotely-simulated packet is done before
  // processing a locally-simulated one.  We're making our best guess about
  // how the packets would be timed with no latency introducing gaps between
  // packets.
  //
  // If the client simulating the packet at the head of the queue disconnects
  // it won't block other packets from being sent, but it will increase their
  // "pessimistic estimates" until that orphaned packet gets cleaned up.

  var queueSizeInBits = 0;
  var pessimisticCompletionTime = this.simulationTime_;
  var queuedRow;
  for (var i = 0; i < this.routerQueueCache_.length; i++) {
    queuedRow = this.routerQueueCache_[i];
    queueSizeInBits += queuedRow.payload.length;
    pessimisticCompletionTime += this.calculateProcessingDurationForMessage_(queuedRow);

    // Don't schedule beyond memory capacity; we're going to drop those packets
    if (this.localSimulationOwnsMessageRow_(queuedRow) &&
        queueSizeInBits <= this.memory) {
      this.scheduleRoutingForRow(queuedRow, pessimisticCompletionTime);
    }
  }
};

/**
 * Checks the schedule for the queued row.  If no schedule entry exists, adds
 * a new one with the provided pessimistic completion time.  If it's already
 * scheduled and the pessimistic time given is BETTER than the previously
 * scheduled completion time, will update the schedule entry with the better
 * time.
 * @param {messageRow} queuedRow
 * @param {number} pessimisticCompletionTime - in local simulation time
 */
NetSimRouterNode.prototype.scheduleRoutingForRow = function (queuedRow,
    pessimisticCompletionTime) {
  var scheduleItem = _.find(this.localRoutingSchedule_, function (item) {
    return item.row.id === queuedRow.id;
  });

  if (scheduleItem) {
    // When our pessimistic time is better than our scheduled time we
    // should update the scheduled time.  This can happen when rows
    // earlier in the queue expire, or are otherwise removed earlier than
    // their size led us to expect.
    if (pessimisticCompletionTime < scheduleItem.completionTime) {
      scheduleItem.completionTime = pessimisticCompletionTime;
    }
  } else {
    // If the item doesn't have a schedule entry at all, add it
    this.addRowToSchedule_(queuedRow, pessimisticCompletionTime);
  }
};

/**
 * Adds a new entry to the routing schedule, with a default expiration time.
 * @param {messageRow} queuedRow - message to route
 * @param {number} completionTime - in simulation time
 * @private
 */
NetSimRouterNode.prototype.addRowToSchedule_ = function (queuedRow,
    completionTime) {
  this.localRoutingSchedule_.push({
    row: queuedRow,
    completionTime: completionTime,
    expirationTime: this.simulationTime_ + PACKET_MAX_LIFETIME_MS,
    beingRouted: false
  });
};

/**
 * Takes a message row out of the routing schedule.  Modifies the schedule,
 * should not be called while iterating through the schedule!
 * Does nothing if the row isn't present in the schedule.
 * @param {messageRow} queuedRow
 * @private
 */
NetSimRouterNode.prototype.removeRowFromSchedule_ = function (queuedRow) {
  var scheduleIdx;
  for (var i = 0; i < this.localRoutingSchedule_.length; i++) {
    if (this.localRoutingSchedule_[i].row.id === queuedRow.id) {
      scheduleIdx = i;
    }
  }
  if (scheduleIdx !== undefined) {
    this.localRoutingSchedule_.splice(scheduleIdx, 1);
  }
};

/**
 * Lets the auto-DNS part of the router simulation handle its requests.
 * For now, auto-DNS can do "batch" processing, no throughput limits.
 * @private
 */
NetSimRouterNode.prototype.tickAutoDns_ = function () {
  if (this.isAutoDnsProcessing_) {
    return;
  }

  // Filter DNS queue down to requests the local simulation should handle.
  var localSimDnsRequests = this.autoDnsQueue_
      .filter(this.localSimulationOwnsMessageRow_.bind(this))
      .map(function (row) {
        return new NetSimMessage(this.shard_, row);
      }.bind(this));

  // If there's nothing we can process, we're done.
  if (localSimDnsRequests.length === 0) {
    return;
  }

  // Process DNS requests
  this.isAutoDnsProcessing_ = true;
  this.processAutoDnsRequests_(localSimDnsRequests, function () {
    this.isAutoDnsProcessing_ = false;
  }.bind(this));
};

/** @inheritdoc */
NetSimRouterNode.prototype.getDisplayName = function () {
  if (netsimGlobals.getLevelConfig().broadcastMode) {
    return i18n.roomNumberX({
      x: this.getRouterNumber()
    });
  }

  return i18n.routerNumberX({
    x: this.getRouterNumber()
  });
};

/**
 * Helper that prevents the router's display number or address from being beyond
 * the representable size of the the router part in the address format (if
 * two-part addresses are being used).
 * Does not do anything special to prevent collisions, just returns entityID
 * modulo the assignable address space - but this will be better than having
 * non-conflicting routers you can never address at all.
 * @returns {number}
 */
NetSimRouterNode.prototype.getRouterNumber = function () {
  var addressFormat = netsimGlobals.getLevelConfig().addressFormat;
  // If two or more parts, limit our router number to the maximum value of
  // the second-to-last address part.
  var addressFormatParts = addressFormat.split(/\D+/).filter(function (part) {
    return part.length > 0;
  }).map(function (part) {
    return parseInt(part, 10);
  }).reverse();

  if (addressFormatParts.length >= 2) {
    var assignableAddressValues = Math.pow(2, addressFormatParts[1]);
    return this.entityID % assignableAddressValues;
  }
  return this.entityID;
};

/**
 * Get node's own address, which is dependent on the address format
 * configured in the level but for routers always ends in zero.
 * @returns {string}
 */
NetSimRouterNode.prototype.getAddress = function () {
  return this.makeLocalNetworkAddress_(ROUTER_LOCAL_ADDRESS);
};

/**
 * Get local network's auto-dns address, which is dependent on the address
 * format configured for the level but the last part should always be 15.
 * @returns {string}
 */
NetSimRouterNode.prototype.getAutoDnsAddress = function () {
  return this.makeLocalNetworkAddress_(AUTO_DNS_RESERVED_ADDRESS);
};

/**
 * Get node's hostname, a modified version of its display name.
 * @returns {string}
 * @override
 */
NetSimRouterNode.prototype.getHostname = function () {
  // Use regex to strip anything that's not a word-character or a digit
  // from the node's display name.  For routers, we don't append the node ID
  // because it's already part of the display name.
  return this.getDisplayName().replace(/[^\w\d]/g, '').toLowerCase();
};

/** @inheritdoc */
NetSimRouterNode.prototype.getNodeType = function () {
  return NodeType.ROUTER;
};

/** @inheritdoc */
NetSimRouterNode.prototype.getStatus = function () {
  var levelConfig = netsimGlobals.getLevelConfig();

  // Determine status based on cached wire data
  var cachedWireRows = this.shard_.wireTable.readAllCached();
  var incomingWireRows = cachedWireRows.filter(function (wireRow) {
    return wireRow.remoteNodeID === this.entityID;
  }, this);

  if (incomingWireRows.length === 0) {
    if (levelConfig.broadcastMode) {
      return i18n.roomStatusNoConnections({
        maximumClients: MAX_CLIENT_CONNECTIONS
      });
    }

    return i18n.routerStatusNoConnections({
      maximumClients: MAX_CLIENT_CONNECTIONS
    });
  }

  var cachedNodeRows = this.shard_.nodeTable.readAllCached();
  var connectedNodeNames = incomingWireRows.map(function (wireRow) {
    var nodeRow = _.find(cachedNodeRows, function (nodeRow) {
      return nodeRow.id === wireRow.localNodeID;
    });
    if (nodeRow) {
      return nodeRow.name;
    }
    return i18n.unknownNode();
  }).join(', ');

  if (incomingWireRows.length >= MAX_CLIENT_CONNECTIONS) {
    if (levelConfig.broadcastMode) {
      return i18n.roomStatusFull({
        connectedClients: connectedNodeNames
      });
    }

    return i18n.routerStatusFull({
      connectedClients: connectedNodeNames
    });
  }

  if (levelConfig.broadcastMode) {
    return i18n.roomStatus({
      connectedClients: connectedNodeNames,
      remainingSpace: (MAX_CLIENT_CONNECTIONS - incomingWireRows.length)
    });
  }

  return i18n.routerStatus({
    connectedClients: connectedNodeNames,
    remainingSpace: (MAX_CLIENT_CONNECTIONS - incomingWireRows.length)
  });
};

/**
 * @returns {boolean} whether the router is at its client connection capacity.
 */
NetSimRouterNode.prototype.isFull = function () {
  // Determine status based on cached wire data
  var cachedWireRows = this.shard_.wireTable.readAllCached();
  var incomingWireRows = cachedWireRows.filter(function (wireRow) {
    return wireRow.remoteNodeID === this.entityID;
  }, this);

  return incomingWireRows.length >= MAX_CLIENT_CONNECTIONS;
};

/**
 * Makes sure that the given specification contains the fields that this
 * router needs to do its job.
 * @param {Packet.HeaderType[]} packetSpec
 * @private
 */
NetSimRouterNode.prototype.validatePacketSpec_ = function (packetSpec) {
  // There are no requirements in broadcast mode
  if (netsimGlobals.getLevelConfig().broadcastMode) {
    return;
  }

  // Require TO_ADDRESS for routing
  if (!packetSpec.some(function (headerField) {
        return headerField === Packet.HeaderType.TO_ADDRESS;
      })) {
    logger.warn("Packet specification does not have a toAddress field.");
  }

  // Require FROM_ADDRESS for auto-DNS tasks
  if (!packetSpec.some(function (headerField) {
        return headerField === Packet.HeaderType.FROM_ADDRESS;
      })) {
    logger.warn("Packet specification does not have a fromAddress field.");
  }
};

/**
 * Puts this router controller into a mode where it will only
 * simulate for connection and messages -from- the given node.
 * @param {!number} nodeID
 */
NetSimRouterNode.prototype.initializeSimulation = function (nodeID) {
  this.simulateForSender_ = nodeID;
  this.packetSpec_ = netsimGlobals.getLevelConfig().routerExpectsPacketHeader;
  this.validatePacketSpec_(this.packetSpec_);

  if (nodeID !== undefined) {
    var nodeChangeEvent = this.shard_.nodeTable.tableChange;
    var nodeChangeHandler = this.onNodeTableChange_.bind(this);
    this.nodeChangeKey_ = nodeChangeEvent.register(nodeChangeHandler);
    
    var wireChangeEvent = this.shard_.wireTable.tableChange;
    var wireChangeHandler = this.onWireTableChange_.bind(this);
    this.wireChangeKey_ = wireChangeEvent.register(wireChangeHandler);

    var logChangeEvent = this.shard_.logTable.tableChange;
    var logChangeHandler = this.onLogTableChange_.bind(this);
    this.logChangeKey_ = logChangeEvent.register(logChangeHandler);

    var newMessageEvent = this.shard_.messageTable.tableChange;
    var newMessageHandler = this.onMessageTableChange_.bind(this);
    this.newMessageEventKey_ = newMessageEvent.register(newMessageHandler);

    // Populate router wire cache with initial data
    var cachedWires = this.shard_.wireTable.readAllCached();
    this.onWireTableChange_(cachedWires);

    // Populate router log cache with initial data
    var cachedLogs = this.shard_.logTable.readAllCached();
    this.onLogTableChange_(cachedLogs);
  }
};

/**
 * Gives the simulating node a chance to unregister from anything it
 * was observing.
 */
NetSimRouterNode.prototype.stopSimulation = function () {
  if (this.nodeChangeKey_ !== undefined) {
    var nodeChangeEvent = this.shard_.messageTable.tableChange;
    nodeChangeEvent.unregister(this.nodeChangeKey_);
    this.nodeChangeKey_ = undefined;
  }
  
  if (this.wireChangeKey_ !== undefined) {
    var wireChangeEvent = this.shard_.messageTable.tableChange;
    wireChangeEvent.unregister(this.wireChangeKey_);
    this.wireChangeKey_ = undefined;
  }

  if (this.logChangeKey_ !== undefined) {
    var logChangeEvent = this.shard_.messageTable.tableChange;
    logChangeEvent.unregister(this.logChangeKey_);
    this.logChangeKey_ = undefined;
  }

  if (this.newMessageEventKey_ !== undefined) {
    var newMessageEvent = this.shard_.messageTable.tableChange;
    newMessageEvent.unregister(this.newMessageEventKey_);
    this.newMessageEventKey_ = undefined;
  }
};

/**
 * Puts the router into the given DNS mode, triggers a remote update,
 * and creates/destroys the network's automatic DNS node.
 * @param {DnsMode} newDnsMode
 */
NetSimRouterNode.prototype.setDnsMode = function (newDnsMode) {
  if (this.dnsMode === newDnsMode) {
    return;
  }

  if (this.dnsMode === DnsMode.NONE) {
    this.dnsNodeID = undefined;
  } else if (this.dnsMode === DnsMode.AUTOMATIC) {
    this.dnsNodeID = AUTO_DNS_RESERVED_ADDRESS;
  }

  this.dnsMode = newDnsMode;
  this.update();
};

/**
 * @param {number} newBandwidth in bits per second
 */
NetSimRouterNode.prototype.setBandwidth = function (newBandwidth) {
  if (this.bandwidth === newBandwidth) {
    return;
  }

  this.bandwidth = newBandwidth;
  this.recalculateSchedule();
  this.update();
};

/**
 * @param {number} newMemory in bits
 */
NetSimRouterNode.prototype.setMemory = function (newMemory) {
  if (this.memory === newMemory) {
    return;
  }

  this.memory = newMemory;
  this.enforceMemoryLimit_();
  this.update();
};

/**
 * Query the wires table and pass the callback a list of wire table rows,
 * where all of the rows are wires attached to this router.
 * @param {NodeStyleCallback} onComplete which accepts an Array of NetSimWire.
 */
NetSimRouterNode.prototype.getConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  var shard = this.shard_;
  var routerID = this.entityID;
  this.shard_.wireTable.readAll(function (err, rows) {
    if (err) {
      onComplete(err, []);
      return;
    }

    var myWires = rows
        .map(function (row) {
          return new NetSimWire(shard, row);
        })
        .filter(function (wire){
          return wire.remoteNodeID === routerID;
        });

    onComplete(null, myWires);
  });
};

/**
 * Query the wires table and pass the callback the total number of wires
 * connected to this router.
 * @param {NodeStyleCallback} onComplete which accepts a number.
 */
NetSimRouterNode.prototype.countConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  this.getConnections(function (err, wires) {
    onComplete(err, wires.length);
  });
};

/**
 * Add a router log entry (not development logging, this is user-facing!)
 * @param {string} packet - binary log payload
 * @param {NetSimLogEntry.LogStatus} status
 */
NetSimRouterNode.prototype.log = function (packet, status) {
  NetSimLogEntry.create(
      this.shard_,
      this.entityID,
      packet,
      status,
      function () {});
};

/**
 * @param {Array} haystack
 * @param {*} needle
 * @returns {boolean} TRUE if needle found in haystack
 */
var contains = function (haystack, needle) {
  return haystack.some(function (element) {
    return element === needle;
  });
};

/**
 * Called when another node establishes a connection to this one, giving this
 * node a chance to reject the connection.
 *
 * The router checks against its connection limit, and rejects the connection
 * if its limit is now exceeded.
 *
 * @param {!NetSimNode} otherNode attempting to connect to this one
 * @param {!NodeStyleCallback} onComplete response method - should call with TRUE
 *        if connection is allowed, FALSE if connection is rejected.
 */
NetSimRouterNode.prototype.acceptConnection = function (otherNode, onComplete) {
  var self = this;
  this.countConnections(function (err, count) {
    if (err) {
      onComplete(err, false);
      return;
    }

    if (count > MAX_CLIENT_CONNECTIONS) {
      onComplete(new Error("Too many connections"), false);
      return;
    }

    // Trigger an update, which will correct our connection count
    self.update(function (err) {
      onComplete(err, err === null);
    });
  });
};

/**
 * Assign a new address for hostname on wire, calling onComplete
 * when done.
 * @param {!NetSimWire} wire that lacks addresses or hostnames
 * @param {string} hostname of requesting node
 * @param {NodeStyleCallback} [onComplete]
 */
NetSimRouterNode.prototype.requestAddress = function (wire, hostname, onComplete) {
  onComplete = onComplete || function () {};

  // General strategy: Create a list of existing remote addresses, pick a
  // new one, and assign it to the provided wire.
  var self = this;
  this.getConnections(function (err, wires) {
    if (err) {
      onComplete(err);
      return;
    }

    var addressList = wires.filter(function (wire) {
      return wire.localAddress !== undefined;
    }).map(function (wire) {
      return wire.localAddress;
    });

    // Generate a list of unused addresses in the addressable space (to a limit)
    var addressFormat = netsimGlobals.getLevelConfig().addressFormat;
    var addressPartSizes = addressFormat.split(/\D+/).filter(function (part) {
      return part.length > 0;
    }).map(function (part) {
      return parseInt(part, 10);
    }).reverse();
    var maxLocalAddresses = Math.min(Math.pow(2, addressPartSizes[0]),
        ADDRESS_OPTION_LIMIT);

    var possibleAddresses = [];
    var nextAddress;
    for (var i = 0; i < maxLocalAddresses; i++) {
      nextAddress = this.makeLocalNetworkAddress_(i);
      // Verify that the address in question is not taken already.
      if (!(nextAddress === this.getAddress() ||
          nextAddress === this.getAutoDnsAddress() ||
          contains(addressList, nextAddress))) {
        possibleAddresses.push(nextAddress);
      }
    }

    // Pick one randomly from the list of possible addresses
    var randomIndex = netsimGlobals.randomIntInRange(0, possibleAddresses.length);
    wire.localAddress = possibleAddresses[randomIndex];
    wire.localHostname = hostname;
    wire.remoteAddress = self.getAddress();
    wire.remoteHostname = self.getHostname();
    wire.update(onComplete);
    // TODO: Fix possibility of two routers getting addresses by verifying
    //       after updating the wire.

    logger.info(this.getDisplayName() + ": Assigned address " +
        wire.localAddress + " to host " + wire.localHostname);
  }.bind(this));
};

/**
 * Generate an address matching the level's configured address format, that
 * falls within this router's local network and ends in the given value.
 * @param {number} lastPart
 * @returns {string}
 * @private
 */
NetSimRouterNode.prototype.makeLocalNetworkAddress_ = function (lastPart) {
  var addressFormat = netsimGlobals.getLevelConfig().addressFormat;
  var usedLastPart = false;
  var usedRouterID = false;

  return addressFormat.split(/(\D+)/).reverse().map(function (part) {
    var bitWidth = parseInt(part, 10);
    if (isNaN(bitWidth)) {
      // This is a non-number part, pass it through to the result
      return part;
    }

    if (!usedLastPart) {
      usedLastPart = true;
      return lastPart.toString();
    }

    if (!usedRouterID) {
      usedRouterID = true;
      return this.getRouterNumber().toString();
    }

    return '0';
  }.bind(this)).reverse().join('');
};

/**
 * @returns {Array} A list of remote nodes connected to this router, including
 *          their hostname, address, whether they are the local node, and
 *          whether they are the current DNS node for the network.
 */
NetSimRouterNode.prototype.getAddressTable = function () {
  var addressTable = this.myWireRowCache_.map(function (row) {
    return {
      hostname: row.localHostname,
      address: row.localAddress,
      isLocal: (row.localNodeID === this.simulateForSender_),
      isDnsNode: (row.localNodeID === this.dnsNodeID)
    };
  }.bind(this));

  // Special case: In auto-dns mode we add the DNS entry to the address table
  if (this.dnsMode === DnsMode.AUTOMATIC) {
    addressTable.push({
      hostname: AUTO_DNS_HOSTNAME,
      address: this.getAutoDnsAddress(),
      isLocal: false,
      isDnsNode: true
    });
  }

  return addressTable;
};

/**
 * Given a node ID, finds the local network address of that node.  Cannot
 * be used to find the address of the router or auto-dns node (since their
 * node IDs are not unique).  Will return undefined if the node ID is not
 * found.
 *
 * @param {number} nodeID
 * @returns {number|undefined}
 * @private
 */
NetSimRouterNode.prototype.getAddressForNodeID_ = function (nodeID) {
  var wireRow = _.find(this.myWireRowCache_, function (row) {
    return row.localNodeID === nodeID;
  });

  if (wireRow !== undefined) {
    return wireRow.localAddress;
  }
  return undefined;
};

/**
 * Given a hostname, finds the local network address of the node with that
 * hostname.  Will return undefined if no node with that hostname is found.
 *
 * @param {string} hostname
 * @returns {number|undefined}
 * @private
 */
NetSimRouterNode.prototype.getAddressForHostname_ = function (hostname) {
  if (hostname === this.getHostname()) {
    return this.getAddress();
  }

  if (this.dnsMode === DnsMode.AUTOMATIC && hostname === AUTO_DNS_HOSTNAME) {
    return this.getAutoDnsAddress();
  }

  var wireRow = _.find(this.myWireRowCache_, function (row) {
    return row.localHostname === hostname;
  });

  if (wireRow !== undefined) {
    return wireRow.localAddress;
  }

  // If we don't have connected routers, this is as far as the auto-DNS can see.
  if (!netsimGlobals.getLevelConfig().connectedRouters) {
    return undefined;
  }

  // Is it some node elsewhere on the shard?
  var nodes = netsimNodeFactory.nodesFromRows(this.shard_,
      this.shard_.nodeTable.readAllCached());
  var node = _.find(nodes, function (node) {
    return node.getHostname() === hostname;
  });
  if (node) {
    return node.getAddress();
  }

  return undefined;
};

/**
 * Given a local network address, finds the node ID of the node at that
 * address.  Will return undefined if no node is found at the given address.
 *
 * @param {string} address
 * @returns {number|undefined}
 * @private
 */
NetSimRouterNode.prototype.getNodeIDForAddress_ = function (address) {
  if (address === this.getAddress()) {
    return this.entityID;
  }

  if (this.dnsMode === DnsMode.AUTOMATIC &&
      address === this.getAutoDnsAddress()) {
    return this.entityID;
  }

  var wireRow = _.find(this.myWireRowCache_, function (row) {
    return row.localAddress === address;
  });

  if (wireRow !== undefined) {
    return wireRow.localNodeID;
  }
  return undefined;
};

/**
 * Given a network address, finds the node that is the next step along the
 * correct path from this router to that address.  Will return null if no
 * path to the address is found.
 * @param {string} address
 * @param {number} hopsRemaining
 * @param {number[]} visitedNodeIDs
 * @returns {NetSimNode|null}
 * @private
 */
NetSimRouterNode.prototype.getNextNodeTowardAddress_ = function (address,
    hopsRemaining, visitedNodeIDs) {
  // Is it us?
  if (address === this.getAddress()) {
    return this;
  }

  // Is it our Auto-DNS node?
  if (this.dnsMode === DnsMode.AUTOMATIC && address === this.getAutoDnsAddress()) {
    return this;
  }

  // Is it a local client?
  var nodes = netsimNodeFactory.nodesFromRows(this.shard_,
      this.shard_.nodeTable.readAllCached());
  var wireRow = _.find(this.myWireRowCache_, function (row) {
    return row.localAddress === address;
  });
  if (wireRow !== undefined) {
    var localClient = _.find(nodes, function (node) {
      return node.entityID === wireRow.localNodeID;
    });
    if (localClient !== undefined) {
      return localClient;
    }
  }

  // End of local subnet cases:
  // In levels where routers are not connected, this is as far as we go.
  var levelConfig = netsimGlobals.getLevelConfig();
  if (!levelConfig.connectedRouters) {
    return null;
  }

  // Is it another node?
  var destinationNode = _.find(nodes, function (node) {
    return address === node.getAddress() ||
        (node.getNodeType() === NodeType.ROUTER && address === node.getAutoDnsAddress());
  });

  // If the node we're after doesn't exist anywhere, we should stop now.
  if (!destinationNode) {
    return null;
  }

  // We are trying to get somewhere else!  Figure out what the target router
  // for our destination is.
  var destinationRouter = null;
  if (destinationNode.getNodeType() === NodeType.ROUTER) {
    destinationRouter = destinationNode;
  } else {
    var destinationWire = destinationNode.getOutgoingWire();
    if (destinationWire) {
      destinationRouter = utils.valueOr(_.find(nodes, function (node) {
        return node.entityID === destinationWire.remoteNodeID;
      }), null);
    }
  }

  if (!destinationRouter) {
    return null;
  }

  // If we have extra hops, we should try and go to a router that is NOT
  // the target router.
  if (hopsRemaining > 0) {
    // Generate the set of possible target routers
    var possibleDestinationRouters = nodes.filter(function (node) {
      return node.getNodeType() === NodeType.ROUTER &&
          node.entityID !== destinationRouter.entityID &&
          node.entityID !== this.entityID &&
          !visitedNodeIDs.some(function (visitedID) {
            return node.entityID === visitedID;
          });
    }, this);
    if (possibleDestinationRouters.length > 0) {
      return netsimGlobals.randomPickOne(possibleDestinationRouters);
    }
  }

  // If there's nowhere else to go or we are out of extra hops, go to the
  // target router.
  return destinationRouter;
};

/**
 * When the node table changes, we check whether our own row has changed
 * and propagate those changes as appropriate.
 * @param rows
 * @private
 * @throws
 */
NetSimRouterNode.prototype.onNodeTableChange_ = function (rows) {
  var myRow = _.find(rows, function (row) {
    return row.id === this.entityID;
  }.bind(this));

  if (myRow === undefined) {
    // This can happen now, to non-primary routers, because detection
    // of the router's removal (stopping its simulation) in NetSimLocalClientNode
    // and this method happen in an uncertain order.
    return;
  }

  if (!_.isEqual(this.stateCache_, myRow)) {
    this.stateCache_ = myRow;
    this.onMyStateChange_(myRow);
  }
};

/**
 * When the wires table changes, we may have a new connection or have lost
 * a connection.  Propagate updates about our connections
 * @param rows
 * @private
 */
NetSimRouterNode.prototype.onWireTableChange_ = function (rows) {
  var myWireRows = rows.filter(function (row) {
    return row.remoteNodeID === this.entityID;
  }.bind(this));

  if (!_.isEqual(this.myWireRowCache_, myWireRows)) {
    this.myWireRowCache_ = myWireRows;
    this.wiresChange.notifyObservers();
  }
};

/**
 * When the logs table changes, we may have a new connection or have lost
 * a connection.  Propagate updates about our connections
 * @param rows
 * @private
 */
NetSimRouterNode.prototype.onLogTableChange_ = function (rows) {
  var myLogRows = rows.filter(function (row) {
    return row.nodeID === this.entityID;
  }.bind(this));

  if (!_.isEqual(this.myLogRowCache_, myLogRows)) {
    this.myLogRowCache_ = myLogRows;
    this.logChange.notifyObservers();
  }
};

/**
 * Get list of log entries in this router's memory.
 * @returns {NetSimLogEntry[]}
 */
NetSimRouterNode.prototype.getLog = function () {
  return this.myLogRowCache_.map(function (row) {
    return new NetSimLogEntry(this.shard_, row, this.packetSpec_);
  }.bind(this));
};

/**
 * @returns {number} the number of packets in the router queue
 */
NetSimRouterNode.prototype.getQueuedPacketCount = function () {
  return this.routerQueueCache_.length;
};

/**
 * @returns {number} router memory currently in use, in bits
 */
NetSimRouterNode.prototype.getMemoryInUse = function () {
  return this.routerQueueCache_.reduce(function (prev, cur) {
    return prev + cur.payload.length;
  }, 0);
};

/**
 * @returns {number} expected router data rate (in bits per second) over the
 *          next second
 */
NetSimRouterNode.prototype.getCurrentDataRate = function () {
  // For simplicity, we're defining the 'curent data rate' as how many bits
  // we expect to get processed in the next second; which is our queue size,
  // capped at our bandwidth.
  return Math.min(this.getMemoryInUse(), this.bandwidth);
};

/**
 * When the message table changes, we might have a new message to handle.
 * Check for and handle unhandled messages.
 * @param {messageRow[]} rows
 * @private
 * @throws if this method is called on a non-simulating router.
 */
NetSimRouterNode.prototype.onMessageTableChange_ = function (rows) {
  if (!this.simulateForSender_) {
    // What?  Only simulating routers should be hooked up to message notifications.
    throw new Error("Non-simulating router got message table change notifiction");
  }

  this.updateRouterQueue_(rows);

  if (this.dnsMode === DnsMode.AUTOMATIC) {
    this.updateAutoDnsQueue_(rows);
  }
};


/**
 * Updates our cache of all messages that are going to the router (regardless
 * of which simulation will handle them), so we can use it for stats and rate
 * limiting.
 * @param {messageRow[]} rows - message table rows
 */
NetSimRouterNode.prototype.updateRouterQueue_ = function (rows) {
  var newQueue = rows.filter(this.isMessageToRouter_.bind(this));
  if (_.isEqual(this.routerQueueCache_, newQueue)) {
    return;
  }

  logger.info(this.getDisplayName() + ': Message queue updated (size ' +
      newQueue.length + ')');

  this.routerQueueCache_ = newQueue;
  this.recalculateSchedule();
  this.enforceMemoryLimit_();
  this.statsChange.notifyObservers(this);
};

/**
 * Checks the router queue for packets beyond the router's memory limit,
 * and drops the first one we simulate locally.  Since this will trigger
 * a table change, this will occur async-recursively until all packets
 * over the memory limit are dropped.
 * @private
 */
NetSimRouterNode.prototype.enforceMemoryLimit_ = function () {
  // Only proceed if a packet we simulate exists beyond the memory limit
  var droppablePacket = this.findFirstLocallySimulatedPacketOverMemoryLimit();
  if (!droppablePacket) {
    return;
  }

  this.removeRowFromSchedule_(droppablePacket);
  var droppableMessage = new NetSimMessage(this.shard_, droppablePacket);
  droppableMessage.destroy(function (err) {
    if (err) {
      // Rarely, this could fire twice for one packet and have one drop fail.
      // That's fine; just don't log if we didn't successfully drop.
      return;
    }

    this.log(droppableMessage.payload, NetSimLogEntry.LogStatus.DROPPED);
  }.bind(this));
};

/**
 * Walk the router queue, and return the first packet we find beyond the router's
 * memory capacity that the local simulation controls and is able to drop.
 * @returns {messageRow|null} null if no such message is found.
 */
NetSimRouterNode.prototype.findFirstLocallySimulatedPacketOverMemoryLimit = function () {
  var packet;
  var usedMemory = 0;
  for (var i = 0; i < this.routerQueueCache_.length; i++) {
    packet = this.routerQueueCache_[i];
    usedMemory += packet.payload.length;
    if (usedMemory > this.memory && this.localSimulationOwnsMessageRow_(packet)) {
      return packet;
    }
  }
  return null;
};

/**
 * @param {messageRow} messageRow
 * @returns {boolean} TRUE if this message is destined for the router (not the
 *          auto-DNS part though!) and FALSE if destined anywhere else.
 * @private
 */
NetSimRouterNode.prototype.isMessageToRouter_ = function (messageRow) {
  if (this.dnsMode === DnsMode.AUTOMATIC && this.isMessageToAutoDns_(messageRow)) {
    return false;
  }

  return messageRow.toNodeID === this.entityID;
};

NetSimRouterNode.prototype.routeMessages_ = function (messages, onComplete) {
  if (messages.length === 0) {
    onComplete(null);
    return;
  }

  this.routeMessage_(messages[0], function (err, result) {
    if (err) {
      onComplete(err, result);
      return;
    }

    this.routeMessages_(messages.slice(1), onComplete);
  }.bind(this));
};

/**
 *
 * @param {NetSimMessage} message
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.routeMessage_ = function (message, onComplete) {
  message.destroy(function (err, result) {
    if (err) {
      onComplete(err, result);
      return;
    }

    // Apply random chance to drop packet, right as we are about to forward it
    if (this.randomDropChance > 0 && netsimGlobals.random() <= this.randomDropChance) {
      this.log(message.payload, NetSimLogEntry.LogStatus.DROPPED);
      onComplete(null);
      return;
    }

    var levelConfig = netsimGlobals.getLevelConfig();
    if (levelConfig.broadcastMode) {
      this.forwardMessageToAll_(message, onComplete);
    } else {
      this.forwardMessageToRecipient_(message, onComplete);
    }
  }.bind(this));
};

/**
 * Forward the given message to all nodes that are connected to this router.
 * This is effectively "hub" operation.
 * @param {NetSimMessage} message
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.forwardMessageToAll_ = function (message, onComplete) {
  // Assumptions for broadcast mode:
  // 1. We can totally ignore packet headers, because addresses don't matter
  // 2. We won't send to the Auto-DNS, since DNS make no sense with no addresses

  // Grab the list of all connected nodes
  var connectedNodeIDs = this.myWireRowCache_.map(function (wireRow) {
    return wireRow.localNodeID;
  });

  this.forwardMessageToNodeIDs_(message, connectedNodeIDs, function (err, result) {
    if (err) {
      this.log(message.payload, NetSimLogEntry.LogStatus.DROPPED);
    } else {
      this.log(message.payload, NetSimLogEntry.LogStatus.SUCCESS);
    }
    onComplete(err, result);
  }.bind(this));
};

/**
 * Forward the given message to the list of node IDs provided.
 * This function works by calling itself recursively with the tail of the
 * node ID list each time it finishes sending one of the messages, so
 * timing on this "broadcast" won't be exactly correct - that's probably okay
 * though, especially at the point in the curriculum where this is used.
 * @param {NetSimMessage} message
 * @param {number[]} nodeIDs
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.forwardMessageToNodeIDs_ = function (message,
    nodeIDs, onComplete) {
  if (nodeIDs.length === 0) {
    // All done!
    onComplete(null);
    return;
  }

  // Send to the first recipient, then recurse on the remaining recipients
  var nextRecipientNodeID = nodeIDs[0];
  NetSimMessage.send(
      this.shard_,
      {
        fromNodeID: this.entityID,
        toNodeID: nextRecipientNodeID,
        simulatedBy: nextRecipientNodeID,
        payload: message.payload
      },
      function (err) {
        if (err) {
          onComplete(err);
          return;
        }
        this.forwardMessageToNodeIDs_(message, nodeIDs.slice(1), onComplete);
      }.bind(this)
  );
};

/**
 * Read the given message to find its destination address, try and map that
 * address to one of our connections, and send the message payload to
 * the new address.
 *
 * @param {NetSimMessage} message
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.forwardMessageToRecipient_ = function (message, onComplete) {
  var toAddress;
  var routerNodeID = this.entityID;

  // Find a connection to route this message to.
  try {
    var packet = new Packet(this.packetSpec_, message.payload);
    toAddress = packet.getHeaderAsAddressString(Packet.HeaderType.TO_ADDRESS);
  } catch (error) {
    logger.warn("Packet not readable by router");
    this.log(message.payload, NetSimLogEntry.LogStatus.DROPPED);
    onComplete(null);
    return;
  }

  var destinationNode = this.getNextNodeTowardAddress_(toAddress,
      message.extraHopsRemaining, message.visitedNodeIDs);
  if (destinationNode === null) {
    // Can't find or reach the address within the simulation
    logger.warn("Destination address not reachable");
    this.log(message.payload, NetSimLogEntry.LogStatus.DROPPED);
    onComplete(null);
    return;
  } else if (destinationNode === this && toAddress === this.getAddress()) {
    // This router IS the packet's destination, it's done.
    logger.warn("Packet stopped at router.");
    this.log(message.payload, NetSimLogEntry.LogStatus.SUCCESS);
    onComplete(null);
    return;
  }

  // TODO: Handle bad state where more than one wire matches dest address?

  // The sender simulates a message until it reaches the final leg of its trip,
  // when it's going to a client node.  At that point, the recipient takes over.
  var simulatingNodeID = message.simulatedBy;
  if (destinationNode.getNodeType() === NodeType.CLIENT) {
    simulatingNodeID = destinationNode.entityID;
  }

  // Create a new message with a new payload.
  NetSimMessage.send(
      this.shard_,
      {
        fromNodeID: routerNodeID,
        toNodeID: destinationNode.entityID,
        simulatedBy: simulatingNodeID,
        payload: message.payload,
        extraHopsRemaining: Math.max(0, message.extraHopsRemaining - 1),
        visitedNodeIDs: message.visitedNodeIDs.concat(this.entityID)
      },
      function (err, result) {
        this.log(message.payload, NetSimLogEntry.LogStatus.SUCCESS);
        onComplete(err, result);
      }.bind(this)
  );
};

/**
 * @param {messageRow} messageRow
 * @returns {boolean} TRUE if the given row should be operated on by the local
 *          simulation, FALSE if another user's simulation should handle it.
 * @private
 */
NetSimRouterNode.prototype.localSimulationOwnsMessageRow_ = function (messageRow) {
  return this.simulateForSender_ &&
      messageRow.simulatedBy === this.simulateForSender_;
};

/**
 * @param {NetSimMessage} message
 * @returns {number} time required to process this message, in milliseconds.
 * @private
 */
NetSimRouterNode.prototype.calculateProcessingDurationForMessage_ = function (message) {
  if (this.bandwidth === Infinity) {
    return 0;
  }
  return message.payload.length * 1000 / this.bandwidth;
};

/**
 * Update queue of all auto-dns messages, which can be used for stats or limiting.
 * @param {messageRow[]} rows
 * @private
 */
NetSimRouterNode.prototype.updateAutoDnsQueue_ = function (rows) {
  var newQueue = rows.filter(this.isMessageToAutoDns_.bind(this));
  if (_.isEqual(this.autoDnsQueue_, newQueue)) {
    return;
  }

  this.autoDnsQueue_ = newQueue;
  // Propagate notification of queue change?
  // Work will proceed on next tick
};

/**
 * @param {messageRow} messageRow
 * @return {boolean}
 */
NetSimRouterNode.prototype.isMessageToAutoDns_ = function (messageRow) {
  var packet, toAddress;
  try {
    packet = new Packet(this.packetSpec_, messageRow.payload);
    toAddress = packet.getHeaderAsAddressString(Packet.HeaderType.TO_ADDRESS);
  } catch (error) {
    logger.warn("Packet not readable by auto-DNS: " + error);
    return false;
  }

  // Messages to the auto-dns are both to and from the router node, and
  // addressed to the DNS.
  return messageRow.toNodeID === this.entityID &&
      messageRow.fromNodeID === this.entityID &&
      toAddress === this.getAutoDnsAddress();
};

/**
 * Batch-process DNS requests, generating responses wherever possible.
 * @param {NetSimMessage[]} messages
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.processAutoDnsRequests_ = function (messages, onComplete) {
  // 1. Remove the requests from the wire
  NetSimEntity.destroyEntities(messages, function (err, result) {
    if (err) {
      onComplete(err, result);
      return;
    }

    // 2. Generate all responses, asynchronously.
    this.generateDnsResponses_(messages, onComplete);
  }.bind(this));
};

/**
 * @param {NetSimMessage[]} messages
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.generateDnsResponses_ = function (messages, onComplete) {
  if (messages.length === 0) {
    onComplete(null);
    return;
  }

  // Process head
  this.generateDnsResponse_(messages[0], function (err, result) {
    if (err) {
      onComplete(err, result);
      return;
    }

    // Process tail
    this.generateDnsResponses_(messages.slice(1), onComplete);
  }.bind(this));
};

/**
 * @param {NetSimMessage} message
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.generateDnsResponse_ = function (message, onComplete) {
  var packet, fromAddress, query, responseHeaders, responseBody, responseBinary;
  var routerNodeID = this.entityID;
  var autoDnsNodeID = this.entityID;

  // Extract message contents
  try {
    packet = new Packet(this.packetSpec_, message.payload);
    fromAddress = packet.getHeaderAsAddressString(Packet.HeaderType.FROM_ADDRESS);
    query = packet.getBodyAsAscii(BITS_PER_BYTE);
  } catch (error) {
    // Malformed packet, ignore
    onComplete(error);
    return;
  }

  // Check that the query is well-formed
  // Regex match "GET [hostnames...]"
  // Then below, we'll split the hostnames on whitespace to process them.
  var requestMatch = query.match(/GET\s+(\S.*)/);
  if (requestMatch !== null) {
    // Good request, look up all addresses and build up response
    // Skipping first match, which is the full regex
    var responses = requestMatch[1].split(/\s+/).map(function (queryHostname) {
      var address = this.getAddressForHostname_(queryHostname);
      return queryHostname + ':' + utils.valueOr(address, AUTO_DNS_NOT_FOUND);
    }.bind(this));
    responseBody = responses.join(' ');
  } else {
    // Malformed request, send back instructions
    responseBody = i18n.autoDnsUsageMessage();
  }

  responseHeaders = {
    fromAddress:this.getAutoDnsAddress(),
    toAddress: fromAddress,
    packetIndex: 1,
    packetCount: 1
  };

  responseBinary = packet.encoder.concatenateBinary(
      packet.encoder.makeBinaryHeaders(responseHeaders),
      asciiToBinary(responseBody, BITS_PER_BYTE));

  NetSimMessage.send(
      this.shard_,
      {
        fromNodeID: autoDnsNodeID,
        toNodeID: routerNodeID,
        simulatedBy: message.simulatedBy,
        payload: responseBinary
      },
      onComplete);
};
