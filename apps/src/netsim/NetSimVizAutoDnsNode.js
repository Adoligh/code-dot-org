/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var netsimGlobals = require('./netsimGlobals');
var NetSimVizNode = require('./NetSimVizNode');

/**
 * @constructor
 * @augments NetSimVizNode
 */
var NetSimVizAutoDnsNode = module.exports = function () {
  NetSimVizNode.call(this);

  this.getRoot().addClass('auto-dns-node');

  var levelConfig = netsimGlobals.getLevelConfig();
  if (levelConfig.showHostnameInGraph) {
    this.setName('dns');
  } else {
    this.setName('DNS');
  }

  this.setIsDnsNode(true);
  this.render();
};
NetSimVizAutoDnsNode.inherits(NetSimVizNode);
