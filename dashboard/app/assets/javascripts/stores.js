// New private scope -- a lot of this is boilerplate for class structures, taken from coffeescript
(function() {
  var
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };


  var $storeEvents = $('head');
  var watchEvents = 0;

  // class UIStore: this is a lightweight inheritable *ABSTRACT* class modeled after Flux
  // UIStore is "offline-aware", meaning that it will load assets in a different way when
  // it knows that there is no network connection.
  var UIStore = (function() {

    function UIStore() {
      this.save = __bind(this.save, this);

      this.value = null; // Empty store
      this.offline = false;

      this.changeEvent = "changed:" + (++watchEvents);
    }

    // Get the value of this store
    UIStore.prototype.value = function() { return this.value; }

    // When this store changes, notify via callback(data)
    UIStore.prototype.subscribe = function(callback) {
      var _this = this;
      callback.fn = callback.fn || function(ev) {
        callback(_this.value);
      };
      $storeEvents.on(this.changeEvent, callback.fn);

      if (this.value)
        callback(this.value);
    }

    UIStore.prototype.unsubscribe = function(callback) {
      $storeEvents.off(this.changeEvent, callback.fn);
    }

    // Internal call to process any data that's being saved
    UIStore.prototype.process = function(data) { return data; }

    // Set the value of this store and notify the dependent
    UIStore.prototype.save = function(data) {
      this.value = this.process(data);
      $storeEvents.trigger(this.changeEvent);
    }

    // Resolve a dynamic asset by combining the base asset filename + a serialized version of the args
    // MUST override this.  It's okay to use args and dataType to determine the URL.
    UIStore.prototype.resolveUrl = function(args, dataType) {
      throw new Error("This store has not specified its URL.");
    }

    // Resolve a static asset by combining the base asset filename + a serialized version of the args
    // MUST override this if you want to support offline access.
    // Example: return "/data/file_" + args.id;
    UIStore.prototype.resolveStatic = function(args) {
      throw new Error("This store does not support offline mode.");
    }

    // Resolve the AJAX parameters for a dynamic request
    // Okay to override this to, for instance, move some of the args into the URL, etc.
    UIStore.prototype.resolve = function(args, dataType) {
      return {
        url: this.resolveUrl(args, dataType),
        data: args
      };
    }

    // Load data into this store
    UIStore.prototype.$load = function(args, dataType, fnSave) {
      dataType = dataType || "json";

      // Set up the AJAX call to request the asset and then store the data, or raise an error.
      var ajax = this.resolve(args, dataType);
      ajax.dataType = dataType;
      ajax.success = fnSave || this.save;
      ajax.error = this.onAjaxError;

      return window.Frame.load(ajax, this.resolveStatic);
    }

    // Load JSON data into this store.
    UIStore.prototype.load = function(args) {
      return this.$load(args, "json");
    }

    // Helper: Load XML and return it as a JSON structure
    UIStore.prototype.loadXML = function(args) {
      return this.$load(args, "xml");
    }

    // Helper: Load HTML into this store, as a string
    UIStore.prototype.loadHTML = function(args) {
      return this.$load(args, "html");
    }

    return UIStore;
  })();




  // class LevelStore extends UIStore
  var LevelStore = (function(_super) {
    __extends(LevelStore, _super);

    // Must have a constructor
    function LevelStore() {
      return LevelStore.__super__.constructor.apply(this, arguments);
    }

    LevelStore.prototype.resolveUrl = function(args, dataType) {
      return "/popup/progress";
    }

    LevelStore.prototype.resolveStatic = function(args) {
      return "level-" + (args.script_name || args.script_id) + "-" + (args.stage_id || "1") + "-" + args.level_id;
    }

    LevelStore.prototype.save = function(data) {
      window.userProgressStore.save(data.progress);
      return LevelStore.__super__.save.apply(this, arguments);
    }

    return LevelStore;
  })(UIStore);


  // ScriptStore: load the script progress (used in the header dropdown)
  var ScriptStore = (function(_super) {
    __extends(ScriptStore, _super);

    // Must have a constructor
    function ScriptStore() {
      return ScriptStore.__super__.constructor.apply(this, arguments);
    }

    ScriptStore.prototype.resolveUrl = function(args, dataType) {
      return "/popup/script";
    }

    ScriptStore.prototype.resolveStatic = function(args) {
      return "script-" + (args.script_name || args.script_id);
    }

    return ScriptStore;
  })(UIStore);


  // UserProgressStore: stores the current user's progress
  var UserProgressStore = (function(_super) {
    __extends(UserProgressStore, _super);

    // Must have a constructor
    function UserProgressStore() {
      return UserProgressStore.__super__.constructor.apply(this, arguments);
    }

    return UserProgressStore;
  })(UIStore);


  // UserInfoStore: stores the current user's information
  var UserInfoStore = (function(_super) {
    __extends(UserInfoStore, _super);

    // Must have a constructor
    function UserInfoStore() {
      return UserInfoStore.__super__.constructor.apply(this, arguments);
    }

    function loadCurrentUser() {
      // For now, the current user's info is always pre-loaded in the page if logged in
      this.save(window.user_info);
    }

    return UserInfoStore;
  })(UIStore);



  // For now, create as global.  Later, these should be in module.exports
  window.UIStore = UIStore;
  window.ScriptStore = ScriptStore;
  window.LevelStore = LevelStore;
  window.UserProgressStore = UserProgressStore;
  window.UserInfoStore = UserInfoStore;

}).call(this);
