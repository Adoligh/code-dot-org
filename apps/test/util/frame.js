/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

function setGlobals () {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="app"></div>';
  // locale file requires Blockly as a global
  try {
    window.Blockly = require('blockly');
    require('../../lib/blockly/en_us');
  } catch (err) {
    console.log(err);
  }
}
module.exports = setGlobals;
