(function (exports) {
'use strict';

var AMPClassList = function () {
  function AMPClassList(component) {
    var tokens = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    babelHelpers.classCallCheck(this, AMPClassList);

    this.component = component;
    this.tokens = tokens;
  }

  babelHelpers.createClass(AMPClassList, [{
    key: 'add',
    value: function add(token) {
      if (this.contains(token)) return;
      this.tokens.push(token);
    }
  }, {
    key: 'contains',
    value: function contains(token) {
      return this.tokens.indexOf(token) !== -1;
    }
  }, {
    key: 'item',
    value: function item(index) {
      return this.tokens[index] || null;
    }
  }, {
    key: 'remove',
    value: function remove(token) {
      var i = this.tokens.indexOf(token);
      if (i === -1) return;
      this.tokens.splice(i, 1);
    }
  }, {
    key: 'toggle',
    value: function toggle(token) {
      if (this.contains(token)) {
        this.remove(token);
      } else {
        this.add(token);
      }
    }
  }, {
    key: 'update',
    value: function update(tokenMap) {
      for (var token in tokenMap) {
        if (tokenMap[token]) {
          this.add(token);
        } else {
          this.remove(token);
        }
      }

      var className = this.toString();
      if (className != this.component.state.className) this.component.setState({ className: className });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.tokens.join(' ');
    }
  }]);
  return AMPClassList;
}();

var AMPComponent = function (_React$Component) {
  babelHelpers.inherits(AMPComponent, _React$Component);

  function AMPComponent(props) {
    babelHelpers.classCallCheck(this, AMPComponent);

    var _this = babelHelpers.possibleConstructorReturn(this, (AMPComponent.__proto__ || Object.getPrototypeOf(AMPComponent)).call(this, props));

    _this.state = {};
    _this.classList = new AMPClassList(_this, _this.props.classList);
    return _this;
  }

  babelHelpers.createClass(AMPComponent, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      var state = this.state;
      var props = this.props;

      if (nextState != null) {
        for (var key in nextState) {
          if (nextState[key] != state[key]) {
            return true;
          }
        }
      }

      // TODO: Is this needed?
      if (nextProps != null) {
        for (var _key in nextProps) {
          if (nextProps[_key] != props[_key]) {
            return true;
          }
        }
      }

      return false;
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      var _this2 = this;

      this.playerEventMap.forEach(function (event) {
        _this2[event.key] = _this2[event.key].bind(_this2);
        _this2.player.addEventListener(event.type, _this2[event.key]);
      });
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _this3 = this;

      this.playerEventMap.forEach(function (event) {
        _this3.player.removeEventListener(event.type, _this3[event.key]);
      });
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        babelHelpers.extends({ ref: "element" }, this.propsList, { className: this.className }),
        this.state.textContent,
        this.props.children
      );
    }
  }, {
    key: "player",
    get: function get() {
      return this.props.player;
    }
  }, {
    key: "config",
    get: function get() {
      return this.props.config;
    }
  }, {
    key: "className",
    get: function get() {
      var className = this.props.className || "";
      className += " " + this.classList;

      return className.trim();
    }
  }, {
    key: "textContent",
    get: function get() {
      return "";
    }
  }, {
    key: "element",
    get: function get() {
      return this.refs.element;
    }
  }, {
    key: "playerEventMap",
    get: function get() {
      var events = [];
      var key = void 0,
          type = void 0;

      if (this.player == null) return events;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = akamai.amp.Events.values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          type = _step.value;

          key = "on" + type;
          if (typeof this[key] != "function") continue;
          events.push({ key: key, type: type });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return events;
    }
  }, {
    key: "propsList",
    get: function get() {
      var _props = this.props,
          player = _props.player,
          config = _props.config,
          className = _props.className,
          classList = _props.classList,
          props = babelHelpers.objectWithoutProperties(_props, ["player", "config", "className", "classList"]);

      return props;
    }
  }]);
  return AMPComponent;
}(React.Component);

var AMPContainer = function (_AMPComponent) {
  babelHelpers.inherits(AMPContainer, _AMPComponent);

  function AMPContainer(props) {
    babelHelpers.classCallCheck(this, AMPContainer);

    var _this = babelHelpers.possibleConstructorReturn(this, (AMPContainer.__proto__ || Object.getPrototypeOf(AMPContainer)).call(this, props));

    _this.state.components = [];
    return _this;
  }

  babelHelpers.createClass(AMPContainer, [{
    key: "addComponent",
    value: function addComponent(component) {
      var components = this.state.components.slice();
      components.push(component);
      this.setState({ components: components });
    }
  }, {
    key: "removeComponent",
    value: function removeComponent(component) {
      var components = this.state.components.filter(function (item) {
        return item != component;
      });
      this.setState({ components: components });
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        babelHelpers.extends({ ref: "element" }, this.propsList, { className: this.className }),
        this.props.children,
        this.state.components
      );
    }
  }]);
  return AMPContainer;
}(AMPComponent);

var AMPControl = function (_AMPComponent) {
  babelHelpers.inherits(AMPControl, _AMPComponent);

  function AMPControl(props) {
    babelHelpers.classCallCheck(this, AMPControl);

    var _this = babelHelpers.possibleConstructorReturn(this, (AMPControl.__proto__ || Object.getPrototypeOf(AMPControl)).call(this, props));

    _this.classList.add("amp-icon");
    _this.classList.add("amp-control");
    _this.mouseFocus = false;
    _this.state.altText = _this.altText;
    return _this;
  }

  babelHelpers.createClass(AMPControl, [{
    key: "onlanguagechange",
    value: function onlanguagechange() {
      this.setState({ altText: this.altText });
    }
  }, {
    key: "onMouseDown",
    value: function onMouseDown(event) {
      this.mouseFocus = true;
    }
  }, {
    key: "onMouseUp",
    value: function onMouseUp(event) {
      this.mouseFocus = false;
    }
  }, {
    key: "onFocus",
    value: function onFocus(event) {
      if (this.mouseFocus == true) return;

      this.classList.update({ "amp-focus": true });
    }
  }, {
    key: "onBlur",
    value: function onBlur(event) {
      if (this.mouseFocus == true) return;

      this.classList.update({ "amp-focus": false });
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(event) {
      if (this.mouseFocus == true) return;

      this.onKeyPress(event);

      if (event.type == "keypress" && (event.keyCode == 13 || event.keyCode == 32)) this.onAction();
    }
  }, {
    key: "onAction",
    value: function onAction() {
      this.onClick();
    }
  }, {
    key: "onKeyPress",
    value: function onKeyPress(event) {}
  }, {
    key: "onClick",
    value: function onClick(event) {}
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement(
        "button",
        babelHelpers.extends({ ref: "element" }, this.propsList, {
          className: this.className,
          tabIndex: "0",
          title: this.state.altText,
          "aria-label": this.state.altText,
          onMouseDown: function onMouseDown(event) {
            return _this2.onMouseDown(event);
          },
          onMouseUp: function onMouseUp(event) {
            return _this2.onMouseUp(event);
          },
          onFocus: function onFocus(event) {
            return _this2.onFocus(event);
          },
          onBlur: function onBlur(event) {
            return _this2.onBlur(event);
          },
          onKeyDown: function onKeyDown(event) {
            return _this2.onKeyDown(event);
          },
          onClick: function onClick(event) {
            return _this2.onClick(event);
          } }),
        this.state.textContent,
        this.props.children,
        this.state.components
      );
    }
  }, {
    key: "propsList",
    get: function get() {
      var _babelHelpers$get = babelHelpers.get(AMPControl.prototype.__proto__ || Object.getPrototypeOf(AMPControl.prototype), "propsList", this),
          altText = _babelHelpers$get.altText,
          props = babelHelpers.objectWithoutProperties(_babelHelpers$get, ["altText"]);

      return props;
    }
  }, {
    key: "altText",
    get: function get() {
      if (this.player == null) return "";
      return this.player.l10n[this.props.altText];
    }
  }]);
  return AMPControl;
}(AMPComponent);

var AMPPanelControl = function (_AMPControl) {
  babelHelpers.inherits(AMPPanelControl, _AMPControl);

  function AMPPanelControl(props) {
    babelHelpers.classCallCheck(this, AMPPanelControl);
    return babelHelpers.possibleConstructorReturn(this, (AMPPanelControl.__proto__ || Object.getPrototypeOf(AMPPanelControl)).call(this, props));
  }

  babelHelpers.createClass(AMPPanelControl, [{
    key: "onClick",
    value: function onClick(event) {
      this.panel.toggle();
    }
  }, {
    key: "panel",
    get: function get() {
      return this.props.panel;
    }
  }, {
    key: "propsList",
    get: function get() {
      var _babelHelpers$get = babelHelpers.get(AMPPanelControl.prototype.__proto__ || Object.getPrototypeOf(AMPPanelControl.prototype), "propsList", this),
          panel = _babelHelpers$get.panel,
          props = babelHelpers.objectWithoutProperties(_babelHelpers$get, ["panel"]);

      return props;
    }
  }]);
  return AMPPanelControl;
}(AMPControl);

var PlayPause = function (_AMPControl) {
  babelHelpers.inherits(PlayPause, _AMPControl);

  function PlayPause(props) {
    babelHelpers.classCallCheck(this, PlayPause);

    var _this = babelHelpers.possibleConstructorReturn(this, (PlayPause.__proto__ || Object.getPrototypeOf(PlayPause)).call(this, props));

    _this.classList.add("amp-playpause");
    return _this;
  }

  babelHelpers.createClass(PlayPause, [{
    key: "onplaying",
    value: function onplaying() {
      this.setState({ altText: this.player.l10n["MSG_PAUSE"] });
    }
  }, {
    key: "onpause",
    value: function onpause() {
      this.setState({ altText: this.player.l10n["MSG_PLAY"] });
    }
  }, {
    key: "onended",
    value: function onended() {
      this.setState({ altText: this.player.l10n["MSG_REPLAY"] });
    }
  }, {
    key: "onClick",
    value: function onClick() {
      var player = this.player;
      switch (player.playState) {
        case "ended":
          player.currentTime = 0;
        case "ready":
        case "paused":
          player.play();
          break;

        default:
          player.pause();
          break;
      }
    }
  }]);
  return PlayPause;
}(AMPControl);

var PauseOverlay = function (_AMPControl) {
  babelHelpers.inherits(PauseOverlay, _AMPControl);

  function PauseOverlay(props) {
    babelHelpers.classCallCheck(this, PauseOverlay);

    var _this = babelHelpers.possibleConstructorReturn(this, (PauseOverlay.__proto__ || Object.getPrototypeOf(PauseOverlay)).call(this, props));

    _this.classList.add("amp-pause-overlay");
    return _this;
  }

  babelHelpers.createClass(PauseOverlay, [{
    key: "onClick",
    value: function onClick() {
      this.player.play();
    }
  }]);
  return PauseOverlay;
}(AMPControl);

var Rewind = function (_AMPControl) {
  babelHelpers.inherits(Rewind, _AMPControl);

  function Rewind(props) {
    babelHelpers.classCallCheck(this, Rewind);

    var _this = babelHelpers.possibleConstructorReturn(this, (Rewind.__proto__ || Object.getPrototypeOf(Rewind)).call(this, props));

    _this.classList.add("amp-rewind");
    return _this;
  }

  babelHelpers.createClass(Rewind, [{
    key: "onClick",
    value: function onClick() {
      this.player.currentTime = Math.max(this.player.currentTime - 15, 0);
    }
  }]);
  return Rewind;
}(AMPControl);

var Utils = function () {
  function Utils() {
    babelHelpers.classCallCheck(this, Utils);
  }

  babelHelpers.createClass(Utils, null, [{
    key: "formatTimecode",


    /**
     * Takes a time in seconds and converts it to timecode.
     * 
     * @param   {Number}  time  The time in seconds to be formatted.
     * @return  {String}  A SMTP formatted string.
     */
    value: function formatTimecode(time, duration) {
      time = parseInt(time);
      if (isNaN(time)) {
        return "00:00";
      }
      var strTime = Utils.formatZeroFill(time % 60);
      time = parseInt(time / 60);
      strTime = Utils.formatZeroFill(time % 60) + ":" + strTime;
      time = parseInt(time / 60);
      if (time > 0) {
        strTime = Utils.formatZeroFill(time) + ":" + strTime;
      }
      if (duration >= 3600 && strTime.length === 5) {
        strTime = "00:" + strTime;
      }
      return strTime;
    }

    /**
     * Converts a time in seconds to a string and adds a zero in front of any number lower than 10.
     * 
     * @param {Number} time The number to be zero filled.
     */

  }, {
    key: "formatZeroFill",
    value: function formatZeroFill(time) {
      var str = time.toString();
      if (time < 10) {
        str = "0" + str;
      }
      return str;
    }

    /**
     * @param {Number} number 
     *    The number to be rounded.
     *
     * @param {Number} precision 
     *    The level of precision. Positive 1 would round to 1 decimal place and -1 would round to the tens.
     *
     * @return {Number}
     *    The rounded number.
     */

  }, {
    key: "round",
    value: function round(number, precision) {
      var factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    }
  }, {
    key: "getElementOffset",
    value: function getElementOffset(element) {
      var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement;

      var left = 0;
      var top = 0;
      var width = element.offsetWidth;
      var height = element.offsetHeight;
      var scrollLeft = 0;
      var scrollTop = 0;

      while (element && element !== root) {
        if (element.tagName === "BODY") {
          scrollLeft = element.scrollLeft || document.documentElement.scrollLeft;
          scrollTop = element.scrollTop || document.documentElement.scrollTop;
          left += element.offsetLeft - scrollLeft + element.clientLeft;
          top += element.offsetTop - scrollTop + element.clientTop;
        } else {
          left += element.offsetLeft - element.scrollLeft + element.clientLeft;
          top += element.offsetTop - element.scrollTop + element.clientTop;
        }
        element = element.offsetParent;
      }

      return { left: left, top: top, width: width, height: height };
    }
  }, {
    key: "getEventPos",
    value: function getEventPos(event) {
      return {
        x: event.clientX || event.targetTouches[0].clientX,
        y: event.clientY || event.targetTouches[0].clientY
      };
    }
  }]);
  return Utils;
}();

var CurrentTime = function (_AMPComponent) {
  babelHelpers.inherits(CurrentTime, _AMPComponent);

  function CurrentTime(props) {
    babelHelpers.classCallCheck(this, CurrentTime);

    var _this = babelHelpers.possibleConstructorReturn(this, (CurrentTime.__proto__ || Object.getPrototypeOf(CurrentTime)).call(this, props));

    _this.state.currentTime = 0;
    return _this;
  }

  babelHelpers.createClass(CurrentTime, [{
    key: "ontimeupdate",
    value: function ontimeupdate() {
      this.setState({ currentTime: Math.round(this.player.currentTime) });
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "span",
        { className: "amp-current-time" },
        Utils.formatTimecode(this.state.currentTime, this.props.player.duration)
      );
    }
  }]);
  return CurrentTime;
}(AMPComponent);

var Duration = function (_AMPComponent) {
  babelHelpers.inherits(Duration, _AMPComponent);

  function Duration(props) {
    babelHelpers.classCallCheck(this, Duration);

    var _this = babelHelpers.possibleConstructorReturn(this, (Duration.__proto__ || Object.getPrototypeOf(Duration)).call(this, props));

    _this.state.duration = props.player.duration;
    return _this;
  }

  babelHelpers.createClass(Duration, [{
    key: "ondurationchange",
    value: function ondurationchange() {
      this.setState({ duration: Math.round(this.player.duration) });
    }
  }, {
    key: "render",
    value: function render() {
      console.log("Duration.render");
      return React.createElement(
        "span",
        { className: "amp-duration" },
        Utils.formatTimecode(this.state.duration, this.state.duration)
      );
    }
  }]);
  return Duration;
}(AMPComponent);

var Slider = function (_AMPControl) {
  babelHelpers.inherits(Slider, _AMPControl);

  function Slider(props) {
    babelHelpers.classCallCheck(this, Slider);

    var _this = babelHelpers.possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, props));

    _this.state.value = 0;
    _this.state.time = 0;
    _this.increment = 0.1;
    _this.classList.add("amp-slider");
    return _this;
  }

  babelHelpers.createClass(Slider, [{
    key: "onClick",
    value: function onClick(event) {
      var offset = Utils.getElementOffset(this.refs.element);
      var pos = Utils.getEventPos(event);
      this.value = (pos.x - offset.left) / offset.width;
    }
  }, {
    key: "onAction",
    value: function onAction() {}
  }, {
    key: "onKeyPress",
    value: function onKeyPress(event) {
      var code = event.keyCode;
      // left arrow	37
      // up arrow	38
      // right arrow	39
      // down arrow	40
      if (code == 39 || code == 38) {
        this.value += this.increment;
      } else if (code == 37 || code == 40) {
        this.value -= this.increment;
      }
    }
  }, {
    key: "valueChanged",
    value: function valueChanged() {}
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var value = Utils.round(this.value * 100, 2) + "%";
      return React.createElement(
        "div",
        babelHelpers.extends({ ref: "element" }, this.propsList, {
          className: this.className,
          tabIndex: "0",
          title: this.state.altText,
          "aria-label": this.state.altText,
          onMouseDown: function onMouseDown(event) {
            return _this2.onMouseDown(event);
          },
          onMouseUp: function onMouseUp(event) {
            return _this2.onMouseUp(event);
          },
          onFocus: function onFocus(event) {
            return _this2.onFocus(event);
          },
          onBlur: function onBlur(event) {
            return _this2.onBlur(event);
          },
          onKeyDown: function onKeyDown(event) {
            return _this2.onKeyPress(event);
          },
          onClick: function onClick(event) {
            return _this2.onClick(event);
          } }),
        React.createElement("div", { className: "amp-value", style: { width: value } }),
        React.createElement("div", { className: "amp-handle", style: { left: value } }),
        React.createElement(AMPContainer, { ref: "markers", className: "amp-markers" }),
        React.createElement(
          "div",
          { className: "amp-text", style: { left: value } },
          this.state.time
        )
      );
    }
  }, {
    key: "value",
    set: function set(value) {
      // TODO: Replace with akamai.amp.Utils.clamp
      value = akamai.amp.utils.Utils.clamp(value, 0, 1);

      if (this.value == value) return;

      this.setState({ value: value });
      this.valueChanged(value);
    },
    get: function get() {
      return this.state.value;
    }
  }, {
    key: "markers",
    get: function get() {
      return this.refs.markers;
    }
  }]);
  return Slider;
}(AMPControl);

var Progress = function (_Slider) {
  babelHelpers.inherits(Progress, _Slider);

  function Progress(props) {
    babelHelpers.classCallCheck(this, Progress);

    var _this = babelHelpers.possibleConstructorReturn(this, (Progress.__proto__ || Object.getPrototypeOf(Progress)).call(this, props));

    _this.classList.add("amp-progress");
    return _this;
  }

  babelHelpers.createClass(Progress, [{
    key: "updateValue",
    value: function updateValue() {
      this.setState({ value: this.player.currentTime / this.player.duration });
    }
  }, {
    key: "ontimeupdate",
    value: function ontimeupdate() {
      this.updateValue();
    }
  }, {
    key: "ondurationchange",
    value: function ondurationchange() {
      this.increment = 10 / this.player.duration;
      this.updateValue();
    }
  }, {
    key: "valueChanged",
    value: function valueChanged(value) {
      this.player.currentTime = value * this.player.duration;
    }
  }]);
  return Progress;
}(Slider);

var Volume = function (_Slider) {
  babelHelpers.inherits(Volume, _Slider);

  function Volume(props) {
    babelHelpers.classCallCheck(this, Volume);

    var _this = babelHelpers.possibleConstructorReturn(this, (Volume.__proto__ || Object.getPrototypeOf(Volume)).call(this, props));

    _this.classList.add("amp-volume");
    _this.state.value = _this.player.volume;
    return _this;
  }

  babelHelpers.createClass(Volume, [{
    key: "onvolumechange",
    value: function onvolumechange() {
      this.setState({ value: this.player.volume });
    }
  }, {
    key: "valueChanged",
    value: function valueChanged(value) {
      this.player.volume = value;
    }
  }]);
  return Volume;
}(Slider);

var Mute = function (_AMPControl) {
  babelHelpers.inherits(Mute, _AMPControl);

  function Mute(props) {
    babelHelpers.classCallCheck(this, Mute);

    var _this = babelHelpers.possibleConstructorReturn(this, (Mute.__proto__ || Object.getPrototypeOf(Mute)).call(this, props));

    _this.state.level = "";
    _this.classList.add("amp-mute");
    return _this;
  }

  babelHelpers.createClass(Mute, [{
    key: "onClick",
    value: function onClick() {
      var player = this.player;
      player.muted = !player.muted;
    }
  }, {
    key: "onvolumechange",
    value: function onvolumechange() {
      var volume = this.player.volume;
      var level = "";

      if (volume == 0) {
        level = "amp-muted";
      } else if (volume < 0.5) {
        level = "amp-low";
      }

      this.setState({ level: level });
    }
  }, {
    key: "className",
    get: function get() {
      return babelHelpers.get(Mute.prototype.__proto__ || Object.getPrototypeOf(Mute.prototype), "className", this) + " " + this.state.level;
    }
  }]);
  return Mute;
}(AMPControl);

var Fullscreen = function (_AMPControl) {
  babelHelpers.inherits(Fullscreen, _AMPControl);

  function Fullscreen(props) {
    babelHelpers.classCallCheck(this, Fullscreen);

    var _this = babelHelpers.possibleConstructorReturn(this, (Fullscreen.__proto__ || Object.getPrototypeOf(Fullscreen)).call(this, props));

    _this.event = document.onwebkitfullscreenchange !== undefined ? "webkitfullscreenchange" : document.onmozfullscreenchange !== undefined ? "mozfullscreenchange" : "fullscreenchange";
    _this.requestFullscreen = (_this.player.container.requestFullscreen || _this.player.container.webkitRequestFullscreen).bind(_this.player.container);
    _this.exitFullscreen = (document.exitFullscreen || document.webkitExitFullscreen).bind(document);
    _this.fullscreenchange = _this.fullscreenchange.bind(_this);
    _this.classList.add("amp-fullscreen");
    return _this;
  }

  babelHelpers.createClass(Fullscreen, [{
    key: "onfullscreenchange",
    value: function onfullscreenchange(event) {
      var key = event.detail ? "MSG_EXIT_FULLSCREEN" : "MSG_ENTER_FULLSCREEN";
      this.setState({ altText: this.player.l10n[key] });
    }
  }, {
    key: "fullscreenchange",
    value: function fullscreenchange() {
      this.classList.update({ "amp-full": this.fullscreenElement != null });
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      babelHelpers.get(Fullscreen.prototype.__proto__ || Object.getPrototypeOf(Fullscreen.prototype), "componentWillMount", this).call(this);
      document.addEventListener(this.event, this.fullscreenchange);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      babelHelpers.get(Fullscreen.prototype.__proto__ || Object.getPrototypeOf(Fullscreen.prototype), "componentWillUnmount", this).call(this);
      document.removeEventListener(this.event, this.fullscreenchange);
    }
  }, {
    key: "onClick",
    value: function onClick() {
      if (this.fullscreenElement == null) {
        this.player.enterFullScreen();
      } else {
        this.player.exitFullScreen();
      }
    }
  }, {
    key: "fullscreenElement",
    get: function get() {
      return document.fullscreenElement || document.webkitFullscreenElement;
    }
  }]);
  return Fullscreen;
}(AMPControl);

var Panel = function (_AMPComponent) {
  babelHelpers.inherits(Panel, _AMPComponent);

  function Panel(props) {
    babelHelpers.classCallCheck(this, Panel);

    var _this = babelHelpers.possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).call(this, props));

    _this.closeHandler = _this.closeHandler.bind(_this);
    return _this;
  }

  babelHelpers.createClass(Panel, [{
    key: "closeHandler",
    value: function closeHandler(event) {
      if (this.element === undefined || this.element.contains(event.target)) return;

      this.open = false;
      document.removeEventListener("click", this.closeHandler);
    }
  }, {
    key: "toggle",
    value: function toggle() {
      this.open = !this.open;
    }
  }, {
    key: "close",
    value: function close() {
      this.open = false;
    }
  }, {
    key: "open",
    set: function set(value) {
      if (value == this._open) return;

      this._open = value;
      this.classList.update({ "amp-open": this._open });

      if (this._open) {
        document.addEventListener("click", this.closeHandler);
        if (this.props.onopen) this.props.onopen(this);
      } else {
        if (this.props.onclose) this.props.onclose(this);
      }
    },
    get: function get() {
      return this._open;
    }
  }, {
    key: "propsList",
    get: function get() {
      var _babelHelpers$get = babelHelpers.get(Panel.prototype.__proto__ || Object.getPrototypeOf(Panel.prototype), "propsList", this),
          onclose = _babelHelpers$get.onclose,
          onopen = _babelHelpers$get.onopen,
          props = babelHelpers.objectWithoutProperties(_babelHelpers$get, ["onclose", "onopen"]);

      return props;
    }
  }]);
  return Panel;
}(AMPComponent);

var PlaybackRate = function (_AMPControl) {
  babelHelpers.inherits(PlaybackRate, _AMPControl);

  function PlaybackRate(props) {
    babelHelpers.classCallCheck(this, PlaybackRate);

    var _this = babelHelpers.possibleConstructorReturn(this, (PlaybackRate.__proto__ || Object.getPrototypeOf(PlaybackRate)).call(this, props));

    _this.rates = ["\xBDx", "1x", "1\xBDx", "2x"];
    _this.state.rate = 1;
    _this.state.textContent = _this.rates[_this.state.rate];
    _this.classList.add("amp-playback-rate");
    return _this;
  }

  babelHelpers.createClass(PlaybackRate, [{
    key: "onClick",
    value: function onClick(event) {
      var rate = this.state.rate + 1;
      if (rate >= this.rates.length) rate = 0;
      this.player.playbackRate = (rate + 1) * 0.5;
      this.setState({ rate: rate, textContent: this.rates[rate] });
    }
  }]);
  return PlaybackRate;
}(AMPControl);

var Bitrate = function (_Panel) {
  babelHelpers.inherits(Bitrate, _Panel);

  function Bitrate(props) {
    babelHelpers.classCallCheck(this, Bitrate);

    var _this = babelHelpers.possibleConstructorReturn(this, (Bitrate.__proto__ || Object.getPrototypeOf(Bitrate)).call(this, props));

    _this.listOptions = [];
    _this.bitrateArray = [];
    _this.state.activeIndex = -1;
    _this.player.addEventListener("bitratelevelsloaded", _this.onBitrateLoaded.bind(_this));
    _this.player.addEventListener("bitratechanging", _this.onBitrateChange.bind(_this));

    return _this;
  }

  babelHelpers.createClass(Bitrate, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.props.bitrate.bitrateArray && this.onBitrateLoaded();
      this.props.bitrate.bitrateIndex !== undefined && this.onBitrateChange();
      this.open = true;
    }
  }, {
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.player.setQuality(index);
    }
  }, {
    key: "onBitrateLoaded",
    value: function onBitrateLoaded(data) {
      this.bitrateArray = data ? data.data.levels : this.props.bitrate.bitrateArray;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.bitrateArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          this.listOptions.push({ "label": item.bitrate });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.setState({ redraw: true });
    }
  }, {
    key: "onBitrateChange",
    value: function onBitrateChange(data) {
      var autoLevel = false;
      try {
        autoLevel = this.player.playerCore.activePlaybackCore.player.autoLevelEnabled === true;
      } catch (e) {}

      var index = autoLevel ? -1 : data ? this.bitrateArray.indexOf(data.data) : this.props.bitrate.bitrateIndex;

      this.setState({ activeIndex: index });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label / 1000,
            " Kbps"
          )
        );
      }, this);

      return React.createElement(
        "div",
        { ref: "element" },
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.gotoSettings.bind(this) },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Quality"
          )
        ),
        React.createElement(
          "div",
          { className: "amp-list-item", onClick: this.clickHandler.bind(this, null, -1) },
          React.createElement("button", { className: -1 === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            "Auto"
          )
        ),
        OptionsList
      );
    }
  }]);
  return Bitrate;
}(Panel);

var Home = function (_Panel) {
  babelHelpers.inherits(Home, _Panel);

  function Home(props) {
    babelHelpers.classCallCheck(this, Home);

    var _this = babelHelpers.possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).call(this, props));

    _this.listOptions = [{ label: "Off" }];
    return _this;
  }

  babelHelpers.createClass(Home, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      if (!index) {
        return this.props.settingsChange({ 'showing': false });
      }
      this.props.settingsChange({ "language": this.listOptions[index].label });
    }
  }, {
    key: "render",
    value: function render() {
      this.listOptions.splice(1);
      for (var lang in this.props.languages) {
        this.listOptions.push({ 'label': this.props.languages[lang] });
      }

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            this.props.player.localization.getLanguageString(object.label) || object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        { ref: "element", className: "amp-captioning-home" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "span",
            { className: "amp-list-highlight", onClick: this.props.gotoSettings.bind(this) },
            React.createElement("button", { className: "amp-icon amp-icon-left" }),
            React.createElement(
              "span",
              null,
              "Subtitles/CC"
            )
          ),
          React.createElement(
            "button",
            { onClick: this.props.viewChange.bind(this, "options"), className: "amp-option-button" },
            "Options"
          )
        ),
        OptionsList
      );
    }
  }]);
  return Home;
}(Panel);

var Options = function (_Panel) {
  babelHelpers.inherits(Options, _Panel);

  function Options(props) {
    babelHelpers.classCallCheck(this, Options);

    var _this = babelHelpers.possibleConstructorReturn(this, (Options.__proto__ || Object.getPrototypeOf(Options)).call(this, props));

    _this.listOptions = [{ label: "Font Family", key: "fontFamily", value: "Arial" }, { label: "Font Color", key: "fontColor", value: "Red" }, { label: "Font Size", key: "fontSize", value: "100%" }, { label: "Font Opacity", key: "fontOpacity", value: "0%" }, { label: "Background Color", key: "backgroundColor", value: "Black" }, { label: "Background Opacity", key: "backgroundOpacity", value: "0%" }, { label: "Window Color", key: "windowColor", value: "Red" }, { label: "Window Opacity", key: "windowOpacity", value: "0%" }, { label: "Character Edge Style", key: "edgeType", value: "None" }, { label: "Scroll", key: "scroll", value: "Pop-out" }];
    return _this;
  }

  babelHelpers.createClass(Options, [{
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {
        var parentKey = object.key.match(/(Color|Opacity|fontSize)/) ? object.key + "Label" : object.key;
        return React.createElement(
          "div",
          { key: object.key, onClick: this.props.viewChange.bind(this, object.key), className: "amp-list-item" },
          React.createElement(
            "span",
            { className: "amp-label" },
            object.label
          ),
          React.createElement("button", { className: "amp-icon amp-icon-right amp-right" }),
          React.createElement(
            "span",
            { className: "amp-right" },
            this.props.captionsettings[parentKey]
          )
        );
      }, this);

      return React.createElement(
        "div",
        { className: "amp-captioning-options" },
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "home") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Options"
          )
        ),
        OptionsList
      );
    }
  }]);
  return Options;
}(Panel);

var BackgroundColor = function (_Panel) {
  babelHelpers.inherits(BackgroundColor, _Panel);

  function BackgroundColor(props) {
    babelHelpers.classCallCheck(this, BackgroundColor);

    var _this = babelHelpers.possibleConstructorReturn(this, (BackgroundColor.__proto__ || Object.getPrototypeOf(BackgroundColor)).call(this, props));

    _this.listOptions = [{ label: "White", value: "rgb(255, 255, 255)" }, { label: "Yellow", value: "rgb(255, 255, 0)" }, { label: "Green", value: "rgb(0, 128, 0)" }, { label: "Cyan", value: "rgb(0, 255, 255)" }, { label: "Blue", value: "rgb(0, 0, 255)" }, { label: "Magenta", value: "rgb(255, 0, 255)" }, { label: "Red", value: "rgb(255, 0, 0)" }, { label: "Black", value: "rgb(0, 0, 0)" }];
    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['backgroundColorLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);
    return _this;
  }

  babelHelpers.createClass(BackgroundColor, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "backgroundColor": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Background Color"
          )
        ),
        OptionsList
      );
    }
  }]);
  return BackgroundColor;
}(Panel);

var BackgroundOpacity = function (_Panel) {
  babelHelpers.inherits(BackgroundOpacity, _Panel);

  function BackgroundOpacity(props) {
    babelHelpers.classCallCheck(this, BackgroundOpacity);

    var _this = babelHelpers.possibleConstructorReturn(this, (BackgroundOpacity.__proto__ || Object.getPrototypeOf(BackgroundOpacity)).call(this, props));

    _this.listOptions = [{ label: "0%", value: "0" }, { label: "25%", value: ".25" }, { label: "50%", value: ".5" }, { label: "75%", value: ".75" }, { label: "100%", value: "1" }];
    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['backgroundOpacityLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);
    return _this;
  }

  babelHelpers.createClass(BackgroundOpacity, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "backgroundOpacity": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Background Opacity"
          )
        ),
        OptionsList
      );
    }
  }]);
  return BackgroundOpacity;
}(Panel);

var CharacterEdgeStyle = function (_Panel) {
  babelHelpers.inherits(CharacterEdgeStyle, _Panel);

  function CharacterEdgeStyle(props) {
    babelHelpers.classCallCheck(this, CharacterEdgeStyle);

    var _this = babelHelpers.possibleConstructorReturn(this, (CharacterEdgeStyle.__proto__ || Object.getPrototypeOf(CharacterEdgeStyle)).call(this, props));

    _this.listOptions = [{ label: "None", value: "" }, { label: "Depressed", value: "" }, { label: "Left Drop Shadow", value: "" }, { label: "Raised", value: "" }, { label: "Right Drop Shadow", value: "" }, { label: "Uniform", value: "" }];
    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['edgeType']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(CharacterEdgeStyle, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "edgeType": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Character Edge Style"
          )
        ),
        OptionsList
      );
    }
  }]);
  return CharacterEdgeStyle;
}(Panel);

var FontColor = function (_Panel) {
  babelHelpers.inherits(FontColor, _Panel);

  function FontColor(props) {
    babelHelpers.classCallCheck(this, FontColor);

    var _this = babelHelpers.possibleConstructorReturn(this, (FontColor.__proto__ || Object.getPrototypeOf(FontColor)).call(this, props));

    _this.listOptions = [{ label: "White", value: "rgb(255, 255, 255)" }, { label: "Yellow", value: "rgb(255, 255, 0)" }, { label: "Green", value: "rgb(0, 128, 0)" }, { label: "Cyan", value: "rgb(0, 255, 255)" }, { label: "Blue", value: "rgb(0, 0, 255)" }, { label: "Magenta", value: "rgb(255, 0, 255)" }, { label: "Red", value: "rgb(255, 0, 0)" }, { label: "Black", value: "rgb(0, 0, 0)" }];
    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['fontColorLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(FontColor, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "fontColor": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {
      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Font Color"
          )
        ),
        OptionsList
      );
    }
  }]);
  return FontColor;
}(Panel);

var FontFamily = function (_Panel) {
  babelHelpers.inherits(FontFamily, _Panel);

  function FontFamily(props) {
    babelHelpers.classCallCheck(this, FontFamily);

    var _this = babelHelpers.possibleConstructorReturn(this, (FontFamily.__proto__ || Object.getPrototypeOf(FontFamily)).call(this, props));

    _this.listOptions = [{ label: "Monospaced Serif", value: "'Courier New', Courier, 'Nimbus Mono L', 'Cutive Mono', monospace" }, { label: "Proportional Serif", value: "'Times New Roman', Times, Georgia, Cambria, 'PT Serif Caption', serif" }, { label: "Monospaced Sans-Serif", value: "'Deja Vu Sans Mono', 'Lucida Console', Monaco, Consolas, 'PT Mono', monospace" }, { label: "Proportional Sans-Serif", value: "Roboto, 'Arial Unicode Ms', Arial, Helvetica, Verdana, 'PT Sans Caption', sans-serif" }, { label: "Casual", value: "'Comic Sans MS', Impact, Handlee, fantasy" }, { label: "Cursive", value: "'Monotype Corsiva', 'URW Chancery L', 'Apple Chancery', 'Dancing Script', cursive" }, { label: "Small Capitals", value: "'Arial Unicode Ms', Arial, Helvetica, Verdana, 'Marcellus SC', sans-serif; font-variant: small-caps" }];
    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['fontFamily']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(FontFamily, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "fontFamily": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Font Family"
          )
        ),
        OptionsList
      );
    }
  }]);
  return FontFamily;
}(Panel);

var FontOpacity = function (_Panel) {
  babelHelpers.inherits(FontOpacity, _Panel);

  function FontOpacity(props) {
    babelHelpers.classCallCheck(this, FontOpacity);

    var _this = babelHelpers.possibleConstructorReturn(this, (FontOpacity.__proto__ || Object.getPrototypeOf(FontOpacity)).call(this, props));

    _this.listOptions = [{ label: "25%", value: ".25" }, { label: "50%", value: ".5" }, { label: "75%", value: ".75" }, { label: "100%", value: "1" }];

    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['fontOpacityLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(FontOpacity, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "fontOpacity": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {
        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Font Opacity"
          )
        ),
        OptionsList
      );
    }
  }]);
  return FontOpacity;
}(Panel);

var FontSize = function (_Panel) {
  babelHelpers.inherits(FontSize, _Panel);

  function FontSize(props) {
    babelHelpers.classCallCheck(this, FontSize);

    var _this = babelHelpers.possibleConstructorReturn(this, (FontSize.__proto__ || Object.getPrototypeOf(FontSize)).call(this, props));

    _this.listOptions = [{ label: "70%", value: "Extra small" }, { label: "100%", value: "Small" }, { label: "150%", value: "Medium" }, { label: "200%", value: "Large" }, { label: "300%", value: "Extra large" }];

    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['fontSizeLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(FontSize, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "fontSize": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Font Size"
          )
        ),
        OptionsList
      );
    }
  }]);
  return FontSize;
}(Panel);

var WindowColor = function (_Panel) {
  babelHelpers.inherits(WindowColor, _Panel);

  function WindowColor(props) {
    babelHelpers.classCallCheck(this, WindowColor);

    var _this = babelHelpers.possibleConstructorReturn(this, (WindowColor.__proto__ || Object.getPrototypeOf(WindowColor)).call(this, props));

    _this.listOptions = [{ label: "White", value: "rgb(255, 255, 255)" }, { label: "Yellow", value: "rgb(255, 255, 0)" }, { label: "Green", value: "rgb(0, 128, 0)" }, { label: "Cyan", value: "rgb(0, 255, 255)" }, { label: "Blue", value: "rgb(0, 0, 255)" }, { label: "Magenta", value: "rgb(255, 0, 255)" }, { label: "Red", value: "rgb(255, 0, 0)" }, { label: "Black", value: "rgb(0, 0, 0)" }];

    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['windowColorLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(WindowColor, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "windowColor": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Window Color"
          )
        ),
        OptionsList
      );
    }
  }]);
  return WindowColor;
}(Panel);

var WindowOpacity = function (_Panel) {
  babelHelpers.inherits(WindowOpacity, _Panel);

  function WindowOpacity(props) {
    babelHelpers.classCallCheck(this, WindowOpacity);

    var _this = babelHelpers.possibleConstructorReturn(this, (WindowOpacity.__proto__ || Object.getPrototypeOf(WindowOpacity)).call(this, props));

    _this.listOptions = [{ label: "0%", value: "0" }, { label: "25%", value: ".25" }, { label: "50%", value: ".5" }, { label: "75%", value: ".75" }, { label: "100%", value: "1" }];

    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['windowOpacityLabel']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(WindowOpacity, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "windowOpacity": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Window Opacity"
          )
        ),
        OptionsList
      );
    }
  }]);
  return WindowOpacity;
}(Panel);

var ScrollType = function (_Panel) {
  babelHelpers.inherits(ScrollType, _Panel);

  function ScrollType(props) {
    babelHelpers.classCallCheck(this, ScrollType);

    var _this = babelHelpers.possibleConstructorReturn(this, (ScrollType.__proto__ || Object.getPrototypeOf(ScrollType)).call(this, props));

    _this.listOptions = [{ label: "Pop-out", value: "pop-out" }, { label: "Roll-on", value: "roll-on" }, { label: "Paint-on", value: "paint-on" }];

    _this.listOptions.map(function (object, index) {
      if (object.label === props.captionsettings['scroll']) {
        this.state.activeIndex = index;
      }
    }, _this);

    return _this;
  }

  babelHelpers.createClass(ScrollType, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      this.setState({ activeIndex: index });
      this.props.settingsChange({ "scroll": { "label": object.label, "value": object.value } });
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: index === this.state.activeIndex ? 'amp-icon amp-list-item-selected' : 'amp-icon' }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "amp-list-item amp-list-title", onClick: this.props.viewChange.bind(this, "options") },
          React.createElement("button", { className: "amp-icon amp-icon-left" }),
          React.createElement(
            "span",
            null,
            "Font Size"
          )
        ),
        OptionsList
      );
    }
  }]);
  return ScrollType;
}(Panel);

var CaptionSettings = function (_Panel) {
  babelHelpers.inherits(CaptionSettings, _Panel);

  function CaptionSettings(props) {
    babelHelpers.classCallCheck(this, CaptionSettings);

    var _this = babelHelpers.possibleConstructorReturn(this, (CaptionSettings.__proto__ || Object.getPrototypeOf(CaptionSettings)).call(this, props));

    _this.state.languages = [];
    _this.state.languageSelected = null;
    _this.state.captionsettings = {
      "edgeType": "None",
      "fontFamily": "Monospaced Serif",
      "fontSize": "Small",
      "fontSizeLabel": "100%",
      "scroll": "Pop-out",
      "backgroundColor": "rgba(255, 255, 255, 1)",
      "fontColor": "rgba(0, 0, 0, 1)",
      "windowColor": "rgba(255, 255, 255, 1)",
      "edgeColor": "rgba(128,128,128, 0.7)",
      "fontColorLabel": "Black",
      "windowColorLabel": "White",
      "backgroundColorLabel": "White",
      "windowOpacityLabel": "100%",
      "fontOpacityLabel": "100%",
      "backgroundOpacityLabel": "100%",
      "languageLabel": "off",
      "visible": null
    };
    _this.state.viewChange = _this.changeView.bind(_this);
    _this.state.settingsChange = _this.changeSettings.bind(_this);
    _this.state.level = "home";
    _this.player.captioning.addEventListener("tracksloaded", _this.tracksloaded.bind(_this));
    _this.player.captioning.addEventListener("trackselected", _this.trackselected.bind(_this));
    return _this;
  }

  babelHelpers.createClass(CaptionSettings, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.props.captionTracks && this.tracksloaded();
      this.open = true;
    }
  }, {
    key: "tracksloaded",
    value: function tracksloaded(data) {
      var languages = [];
      var tracks = data ? data.detail : this.props.captionTracks;
      var len = tracks.length;
      var track = null;

      for (var i = 0; i < len; i++) {
        track = tracks[i];
        if (track.kind != "captions") continue;
        languages.push(track.language || "Unknown CC");
      }
      this.setState({ languages: languages });
    }
  }, {
    key: "trackselected",
    value: function trackselected(event) {
      this.state.languageSelected = event.detail.language;
    }
  }, {
    key: "selectLanguage",
    value: function selectLanguage(lang) {
      this.showing = true;
      this.player.captioning.selectTrackByLanguage(lang);
    }
  }, {
    key: "setCaptionSettings",
    value: function setCaptionSettings() {
      var settingObject = Object.assign({}, this.state.captionsettings);
      for (var key in settingObject) {
        if (key.endsWith('Label')) {
          delete settingObject[key];
        }
      }
      settingObject.visible = !this.showing;
      this.player.captioning.changeSettings(settingObject);
      console.log("settingObject", settingObject);
    }
  }, {
    key: "changeView",
    value: function changeView(toState) {
      var _this2 = this;

      setTimeout(function () {
        _this2.setState({ level: toState });
      }, 100);
    }
  }, {
    key: "changeSettings",
    value: function changeSettings(toLevel) {
      if ((typeof toLevel === "undefined" ? "undefined" : babelHelpers.typeof(toLevel)) === "object") {
        var object = toLevel;
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            var value = object[key];
            switch (key) {
              case "showing":
                this.showing = false;
                break;
              case "language":
                this.state.lang = value;
                this.state.captionsettings.languageLabel = value;
                this.selectLanguage(value);
                break;
              case "fontSize":
                this.state.captionsettings[key] = value['value'];
                this.state.captionsettings[key + 'Label'] = value['label'];
                break;
              case "edgeType":
              case "fontFamily":
              case "scroll":
                this.state.captionsettings[key] = value['label'];
                break;
              case "backgroundColor":
              case "fontColor":
              case "windowColor":
                var matchColors = /rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), ((\d{0,1}.\d{1,2})|(\d{1}))?\)/;
                var opacity = matchColors.exec(this.state.captionsettings[key])[4];
                if ((typeof value === "undefined" ? "undefined" : babelHelpers.typeof(value)) === "object") {
                  this.state.captionsettings[key + "Label"] = value.label;
                  value = value.value;
                }
                this.state.captionsettings[key] = value.replace(")", ", " + opacity + ")").replace("rgb", "rgba");
                break;
              case "backgroundOpacity":
              case "fontOpacity":
              case "windowOpacity":
                if ((typeof value === "undefined" ? "undefined" : babelHelpers.typeof(value)) === "object") {
                  this.state.captionsettings[key + "Label"] = value.label;
                  value = value.value;
                }
                key = key.replace("Opacity", "Color");
                matchColors = /rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), ((\d{0,1}.\d{1,2})|(\d{1}))?\)/;
                var rgba = matchColors.exec(this.state.captionsettings[key]);
                this.state.captionsettings[key] = "rgba(" + rgba[1] + ", " + rgba[2] + ", " + rgba[3] + ", " + value + ")";
                break;

              default:

            }
            this.setCaptionSettings();
          }
        }

        return;
      }
    }
  }, {
    key: "getCurrentPage",
    value: function getCurrentPage() {

      switch (this.state.level) {
        case "home":
          return React.createElement(Home, babelHelpers.extends({ languages: this.state.languages, player: this.player }, this.state, { gotoSettings: this.props.gotoSettings.bind(this) }));
          break;
        case "options":
          return React.createElement(Options, this.state);
          break;
        case "fontFamily":
          return React.createElement(FontFamily, this.state);
          break;
        case "fontColor":
          return React.createElement(FontColor, this.state);
          break;
        case "fontSize":
          return React.createElement(FontSize, this.state);
          break;
        case "fontOpacity":
          return React.createElement(FontOpacity, this.state);
          break;
        case "backgroundColor":
          return React.createElement(BackgroundColor, this.state);
          break;
        case "backgroundOpacity":
          return React.createElement(BackgroundOpacity, this.state);
          break;
        case "windowColor":
          return React.createElement(WindowColor, this.state);
          break;
        case "windowOpacity":
          return React.createElement(WindowOpacity, this.state);
          break;
        case "edgeType":
          return React.createElement(CharacterEdgeStyle, this.state);
          break;
        case "scroll":
          return React.createElement(ScrollType, this.state);

      }
    }
  }, {
    key: "render",
    value: function render() {
      var localization = this.player.localization;
      return React.createElement(
        "div",
        { ref: "element" },
        this.getCurrentPage()
      );
    }
  }, {
    key: "showing",
    set: function set(value) {
      this.state.captionsettings.visible = value;
      this.player.captioning.setHidden(!value);
    },
    get: function get() {
      return this.player.captioning.getHidden();
    }
  }]);
  return CaptionSettings;
}(Panel);

var Settings = function (_Panel) {
  babelHelpers.inherits(Settings, _Panel);

  function Settings(props) {
    babelHelpers.classCallCheck(this, Settings);

    var _this = babelHelpers.possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).call(this, props));

    _this.state = {
      settingsLevel: 0,
      bitrateLabel: "Auto"
    };
    _this.player.captioning.addEventListener("trackselected", _this.trackselected.bind(_this));
    _this.player.captioning.addEventListener("tracksloaded", _this.tracksloaded.bind(_this));
    _this.player.addEventListener("bitratechanging", _this.bitrateChange.bind(_this));
    _this.player.addEventListener("bitratelevelsloaded", _this.bitratesLoaded.bind(_this));
    return _this;
  }

  babelHelpers.createClass(Settings, [{
    key: "trackselected",
    value: function trackselected(track) {
      var lang = this.props.player.localization.getLanguageString(track.detail.language) || track.detail.language || "None";
      this.setState({ language: lang });
    }
  }, {
    key: "tracksloaded",
    value: function tracksloaded(data) {
      this.state.captioningTracks = data.detail;
    }
  }, {
    key: "bitratesLoaded",
    value: function bitratesLoaded(event) {
      this.state.bitrateArray = event.data.levels;
    }
  }, {
    key: "bitrateChange",
    value: function bitrateChange(event) {
      var brLabel = event.detail.bitrate ? event.detail.bitrate / 1000 + "Kbps" : "Auto";
      this.state.bitrateIndex = this.state.bitrateArray ? this.state.bitrateArray.indexOf(event.detail) : -1;
      this.setState({ bitrateLabel: brLabel });
    }
  }, {
    key: "changeState",
    value: function changeState(value) {
      var _this2 = this;

      setTimeout(function () {
        _this2.setState({ settingsLevel: value });
      }, 100);
    }
  }, {
    key: "render",
    value: function render() {
      switch (this.state.settingsLevel) {
        case 0:
          return React.createElement(
            "div",
            babelHelpers.extends({ ref: "element" }, this.propsList, { className: "amp-settings amp-panel " + this.className }),
            React.createElement(
              "div",
              { className: "amp-list-item", onClick: this.changeState.bind(this, 1) },
              React.createElement(
                "span",
                { className: "amp-label" },
                "Subtitles"
              ),
              React.createElement("button", { className: "amp-icon amp-icon-right amp-right" }),
              React.createElement(
                "span",
                { className: "amp-right" },
                this.state.language
              )
            ),
            React.createElement(
              "div",
              { className: "amp-list-item", onClick: this.changeState.bind(this, 2) },
              React.createElement(
                "span",
                { className: "amp-label" },
                "Bitrate"
              ),
              React.createElement("button", { className: "amp-icon amp-icon-right amp-right" }),
              React.createElement(
                "span",
                { className: "amp-right" },
                this.state.bitrateLabel
              )
            )
          );
          break;
        case 1:
          return React.createElement(
            "div",
            { ref: "element", className: "amp-captioning-settings amp-panel " + this.className },
            React.createElement(CaptionSettings, { captionTracks: this.state.captioningTracks, player: this.player, gotoSettings: this.changeState.bind(this, 0) })
          );
          break;
        case 2:
          return React.createElement(
            "div",
            { ref: "element", className: "amp-bitrate amp-panel " + this.className },
            React.createElement(Bitrate, { bitrate: this.state, player: this.player, gotoSettings: this.changeState.bind(this, 0) })
          );
          break;
      }
    }
  }]);
  return Settings;
}(Panel);

var Share = function (_Panel) {
  babelHelpers.inherits(Share, _Panel);

  function Share(props) {
    babelHelpers.classCallCheck(this, Share);

    var _this = babelHelpers.possibleConstructorReturn(this, (Share.__proto__ || Object.getPrototypeOf(Share)).call(this, props));

    _this.listOptions = [{ label: "Facebook", icon: "amp-fb", url: "www.facebook.html" }, { label: "Twitter", icon: "amp-tw", url: "" }];
    return _this;
  }

  babelHelpers.createClass(Share, [{
    key: "clickHandler",
    value: function clickHandler(object, index) {
      if (confirm("Would you like to share on:" + object.label) == true) {
        alert("You clicked to share");
      } else {
        alert("You did not share");
      }
    }
  }, {
    key: "render",
    value: function render() {

      var OptionsList = this.listOptions.map(function (object, index) {

        return React.createElement(
          "div",
          { key: index, className: "amp-list-item", onClick: this.clickHandler.bind(this, object, index) },
          React.createElement("button", { className: "amp-icon " + object.icon }),
          React.createElement(
            "span",
            null,
            object.label
          )
        );
      }, this);

      return React.createElement(
        "div",
        { ref: "element", className: "amp-share amp-panel " + this.className },
        OptionsList
      );
    }
  }]);
  return Share;
}(Panel);

var CaptionToggleButton = function (_AMPControl) {
  babelHelpers.inherits(CaptionToggleButton, _AMPControl);

  function CaptionToggleButton(props) {
    babelHelpers.classCallCheck(this, CaptionToggleButton);
    return babelHelpers.possibleConstructorReturn(this, (CaptionToggleButton.__proto__ || Object.getPrototypeOf(CaptionToggleButton)).call(this, props));
  }

  babelHelpers.createClass(CaptionToggleButton, [{
    key: "onClick",
    value: function onClick(event) {
      this.player.captioning.setHidden(!this.player.captioning.getHidden());
    }
  }]);
  return CaptionToggleButton;
}(AMPControl);

var UI = function (_AMPComponent) {
  babelHelpers.inherits(UI, _AMPComponent);

  function UI(props) {
    babelHelpers.classCallCheck(this, UI);

    var _this = babelHelpers.possibleConstructorReturn(this, (UI.__proto__ || Object.getPrototypeOf(UI)).call(this, props));

    _this._playstate = "ready";
    _this._activeLoced = false;
    _this.state.media = {};
    _this.timeout = null;
    return _this;
  }

  babelHelpers.createClass(UI, [{
    key: "onmediachange",
    value: function onmediachange(event) {
      var media = this.player.media;
      this.container.classList.update({ "amp-text-tracks": media.tracks && media.tracks.length });
      this.setState({ media: media });
    }
  }, {
    key: "onplaystatechange",
    value: function onplaystatechange(event) {
      var state = event.detail.value;
      if (state == "waiting") return;
      this.playstate = state;
    }
  }, {
    key: "onplaying",
    value: function onplaying() {
      this.waiting = false;
    }
  }, {
    key: "onseeking",
    value: function onseeking() {
      this.waiting = true;
    }
  }, {
    key: "onseeked",
    value: function onseeked() {
      this.waiting = false;
    }
  }, {
    key: "onwaiting",
    value: function onwaiting() {
      this.waiting = true;
    }
  }, {
    key: "togglePlayPause",
    value: function togglePlayPause() {
      if (this.player.paused) {
        this.player.play();
      } else {
        this.player.pause();
      }
    }
  }, {
    key: "mouseenter",
    value: function mouseenter() {
      clearTimeout(this.timeout);
      this.container.classList.update({ "amp-active": true, "amp-inactive": false });
    }
  }, {
    key: "mouseleave",
    value: function mouseleave() {
      var _this2 = this;

      if (this.activeLocked == true || this.playstate == "ready" || this.playstate == "paused") return;

      this.container.classList.update({ "amp-active": false, "amp-inactive": true });
      this.timeout = setTimeout(function () {
        _this2.container.classList.update({ "amp-inactive": false });
      }, this.config.autoHide * 1000);
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      console.log("UI.render");
      return React.createElement(
        AMPContainer,
        { ref: "container", className: "amp-ui", classList: ["amp-ready", "amp-active"],
          onMouseEnter: function onMouseEnter() {
            return _this3.mouseenter();
          }, onMouseLeave: function onMouseLeave() {
            return _this3.mouseleave();
          },
          onFocus: function onFocus(event) {
            return console.log(event.type, event);
          },
          onBlur: function onBlur(event) {
            return console.log(event.type, event);
          } },
        React.createElement("div", { className: "amp-interactive", onClick: function onClick() {
            return _this3.togglePlayPause();
          }, tabIndex: "-1" }),
        React.createElement("img", { className: "amp-poster", src: this.state.media.poster, tabIndex: "-1" }),
        React.createElement(PauseOverlay, { ref: "pauseOverlay", altText: "MSG_PLAY", player: this.player }),
        React.createElement(Progress, { ref: "progress", player: this.player }),
        React.createElement(
          AMPContainer,
          { ref: "controls", className: "amp-controls" },
          React.createElement(PlayPause, { ref: "playpause", altText: "MSG_PLAY", player: this.player }),
          React.createElement(Rewind, { ref: "rewind", altText: "MSG_REWIND", player: this.player }),
          React.createElement(
            "div",
            { ref: "timeDisplay", className: "amp-time-display" },
            React.createElement(CurrentTime, { ref: "currentTime", player: this.player }),
            React.createElement("span", { ref: "timeSeparator", className: "amp-time-separator" }),
            React.createElement(Duration, { ref: "duration", player: this.player })
          ),
          React.createElement(Mute, { ref: "mute", altText: "MSG_MUTE", player: this.player }),
          React.createElement(Volume, { ref: "volume", altText: "MSG_VOLUME", player: this.player }),
          React.createElement("div", { ref: "spacer1", className: "amp-spacer" }),
          React.createElement("div", { ref: "spacer2", className: "amp-spacer" }),
          React.createElement(PlaybackRate, { ref: "playbackrate", altText: "MSG_PLAYBACK_RATE", player: this.player }),
          React.createElement(AMPPanelControl, { ref: "share", altText: "MSG_SHARE", className: "amp-share", player: this.player, panel: this.refs.sharePanel }),
          React.createElement(CaptionToggleButton, { ref: "cc", altText: "MSG_CC", className: "amp-cc", player: this.player }),
          React.createElement(AMPPanelControl, { ref: "settings", altText: "MSG_SETTINGS", className: "amp-settings", player: this.player, panel: this.refs.settingsPanel }),
          React.createElement(Fullscreen, { ref: "fullscreen", altText: "MSG_ENTER_FULLSCREEN", player: this.player })
        ),
        React.createElement(Share, { ref: "sharePanel", player: this.player }),
        React.createElement(Settings, { ref: "settingsPanel", player: this.player })
      );
    }
  }, {
    key: "destroy",
    value: function destroy() {
      ReactDOM.unmountComponentAtNode(this._container);
    }
  }, {
    key: "container",
    get: function get() {
      return this.refs.container;
    }
  }, {
    key: "components",
    get: function get() {
      return this.refs;
    }
  }, {
    key: "playstate",
    set: function set(value) {
      var _updates;

      if (this._playstate == value) return;

      var updates = (_updates = {}, babelHelpers.defineProperty(_updates, "amp-" + this._playstate, false), babelHelpers.defineProperty(_updates, "amp-" + value, true), _updates);
      this._playstate = value;
      this.container.classList.update(updates);
    },
    get: function get() {
      return this._playstate;
    }
  }, {
    key: "waiting",
    set: function set(value) {
      if (this._waiting == value) return;
      this._waiting = value;
      this.container.classList.update({ "amp-waiting": this._waiting });
    }
  }], [{
    key: "createElement",
    value: function createElement(player) {
      var element = document.createElement("div");
      element.className = "amp-react";
      var ready = function ready() {
        player.getViewComponent().appendChild(element);
        player.removeEventListener("ready", ready);
      };
      player.addEventListener("ready", ready);
      return element;
    }
  }, {
    key: "create",
    value: function create(player, config) {
      return new Promise(function (resolve, reject) {
        var element = UI.createElement(player);
        resolve(ReactDOM.render(React.createElement(UI, { player: player, config: config }), element));
      });
    }
  }]);
  return UI;
}(AMPComponent);

akamai.amp.AMP.registerPlugin("react", UI.create);

exports.UI = UI;
exports.AMPComponent = AMPComponent;
exports.AMPContainer = AMPContainer;
exports.AMPClassList = AMPClassList;

}((this.akamai.amp.react = this.akamai.amp.react || {})));
//# sourceMappingURL=React.js.map
