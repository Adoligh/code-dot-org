var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

var _ = require('@cdo/apps/utils').getLodash();
var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimTable = require('@cdo/apps/netsim/NetSimTable');
var netsimGlobals = require('@cdo/apps/netsim/netsimGlobals');
var levels = require('@cdo/apps/netsim/levels');

/**
 * Checks whether the given table has the specified number of rows.
 *
 * @param {!NetSimShard} shard - Ideally a fakeShard
 * @param {!string} tableName - Passed a string instead of the table for error
 *        message readability.  Should be name of a member of the shard.
 * @param {!number} size - Expected number of rows.
 */
exports.assertTableSize = function (shard, tableName, size) {
  var rowCount;
  shard[tableName].readAll(function (err, rows) {
    rowCount = rows.length;
  });
  assert(rowCount === size, "Expected table '" + tableName +
      "' to contain " + size + " rows, but it had " + rowCount +
      " rows.");
};

// TODO (brent) - to start with, this is just going to call right back into our
// remoteTable (i.e. apps version of clientApi). Eventually we will want that to
// change
exports.overrideClientApi = function (netsimTable) {
  var storageTable = netsimTable.remoteTable_;

  // send client api calls through our fake storage table for nwo
  netsimTable.clientApi_ = {
    all: function (callback) {
      return storageTable.readAll(callback);
    }
  };

  return netsimTable;
};

/**
 * Storage table API placeholder for testing, always hits callbacks immediately
 * so tests can be written imperatively.
 * @returns {Object}
 */
exports.fakeStorageTable = function () {
  var log_ = '';
  var rowIndex_ = 1;
  var tableData_ = [];

  return {

    /**
     * @param {!NodeStyleCallback} callback
     */
    readAll: function (callback) {
      log_ += 'readAll';

      callback(null, tableData_);
    },

    /**
     * @param {!number} id
     * @param {!NodeStyleCallback} callback
     */
    read: function (id, callback) {
      log_ += 'read[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          callback(null, tableData_[i]);
          return;
        }
      }
      callback(new Error('Not Found'), null);
    },

    /**
     * @param {!Object} value
     * @param {!NodeStyleCallback} callback
     */
    create: function (value, callback) {
      log_ += 'create[' + JSON.stringify(value) + ']';

      value.id = rowIndex_;
      rowIndex_++;
      tableData_.push(value);

      callback(null, value);
    },

    /**
     * @param {!number} id
     * @param {!Object} value
     * @param {!NodeStyleCallback} callback
     */
    update: function (id, value, callback) {
      log_ += 'update[' + id + ', ' + JSON.stringify(value) + ']';

      value.id = id;
      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          tableData_[i] = value;
          callback(null, null);
          return;
        }
      }

      callback(new Error('Not Found'), null);
    },

    /**
     * @param {!number} id
     * @param {!NodeStyleCallback} callback
     */
    delete: function (id, callback) {
      log_ += 'delete[' + id + ']';

      for (var i = 0; i < tableData_.length; i++) {
        if (tableData_[i].id === id) {
          tableData_.splice(i, 1);
          callback(null, null);
          return;
        }
      }

      callback(new Error('Not Found'), null);
    },

    /**
     * @returns {string}
     */
    log: function () {
      if (arguments.length > 0) {
        log_ = arguments[0];
      }

      return log_;
    }
  };
};

/**
 * Fake set of storage tables for use in tests.
 */
exports.fakeShard = function () {
  var nodeTable_ = exports.fakeStorageTable();
  var wireTable_ = exports.fakeStorageTable();
  var messageTable_ = exports.fakeStorageTable();
  var logTable_ = exports.fakeStorageTable();
  var heartbeatTable_ = exports.fakeStorageTable();

  return {
    remoteNodeTable: nodeTable_,
    nodeTable: exports.overrideClientApi(new NetSimTable(nodeTable_)),

    remoteWireTable: wireTable_,
    wireTable: exports.overrideClientApi(new NetSimTable(wireTable_)),

    remoteMessageTable: messageTable_,
    messageTable: exports.overrideClientApi(new NetSimTable(messageTable_)),

    remoteLogTable: logTable_,
    logTable: exports.overrideClientApi(new NetSimTable(logTable_)),

    remoteHeartbeatTable: heartbeatTable_,
    heartbeatTable: exports.overrideClientApi(new NetSimTable(heartbeatTable_))
  };
};

/**
 * Set up global singleton with default level configuration
 */
exports.initializeGlobalsToDefaultValues = function () {
  NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
  // Deep clone level so that changes we make to it for testing don't bleed
  // into other tests.
  netsimGlobals.setRootControllers({}, {
    level: _.clone(levels.custom, true)
  });
};
