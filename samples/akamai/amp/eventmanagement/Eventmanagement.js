(function (exports) {
'use strict';

var EventManagement$1 = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(EventManagement, _akamai$amp$Plugin);

  function EventManagement(player, config) {
    babelHelpers.classCallCheck(this, EventManagement);

    var _this = babelHelpers.possibleConstructorReturn(this, (EventManagement.__proto__ || Object.getPrototypeOf(EventManagement)).call(this, player, config));

    _this.poller = new akamai.amp.Poller();
    _this.poller.ondatachange = function (event) {
      var id = event.detail;
      var state = null;

      if (id == "on") {
        state = { id: "on" };
      } else {
        var states = _this.states;
        for (var i = 0, len = _this.states.length; i < len; i++) {
          if (states[i].id == id) {
            state = states[i];
            break;
          }
        }
      }

      if (state != null) {
        _this.state = state;
      }
    };

    _this.states = config.states || [];
    _this.url = config.url;
    _this.interval = config.interval || 5;
    _this.poster = document.createElement("img");
    _this.poster.className = "amp-event-poster";
    return _this;
  }

  babelHelpers.createClass(EventManagement, [{
    key: "onready",
    value: function onready() {
      this.poller.start();
    }
  }, {
    key: "url",
    set: function set(value) {
      this.poller.url = value;
    },
    get: function get() {
      return this.poller.url;
    }
  }, {
    key: "interval",
    get: function get() {
      return this.poller.interval / 1000;
    },
    set: function set(value) {
      this.poller.interval = value * 1000;
    }
  }, {
    key: "state",
    set: function set(value) {
      if (this._state == value) return;

      this._state = value;
      this.dispatchEvent(new akamai.amp.Event("statechange", value));

      switch (this._state.id) {
        case "on":
          if (this.player.container.contains(this.poster)) {
            this.player.container.removeChild(this.poster);
          }
          if (this.player.autoplay === true) this.player.play();
          break;

        default:
          if (this._state.poster != null) {
            this.poster.src = this._state.poster;
            this.player.container.appendChild(this.poster);
          }
          this.player.pause();
          this.player.displayState = akamai.amp.DisplayState.NORMAL;
          break;
      }
    },
    get: function get() {
      return this._state;
    }
  }]);
  return EventManagement;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("eventmanagement", akamai.amp.Plugin.createFactory(EventManagement$1));

exports.EventManagement = EventManagement$1;

}((this.akamai.amp.eventmanagement = this.akamai.amp.eventmanagement || {})));
//# sourceMappingURL=Eventmanagement.js.map
