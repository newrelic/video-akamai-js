(function (exports) {
'use strict';

var Mouse = function () {
  function Mouse(enabled, speed) {
    babelHelpers.classCallCheck(this, Mouse);

    this.NAME = "mouse-rotation";

    this.register(enabled, speed);
  }

  babelHelpers.createClass(Mouse, [{
    key: 'register',
    value: function register(enabled, speed) {
      AFRAME.registerComponent(this.NAME, {
        schema: {
          enabled: { default: enabled || false },
          dx: { default: 2.0 },
          dy: { default: 2.0 },
          speed: { default: speed != null ? speed / 10 : 0.3 }
        },
        rotateEnd_: null,
        init: function init() {
          this.onMouseUp_ = this.onMouseUp_.bind(this);
          this.onMouseDown_ = this.onMouseDown_.bind(this);
          this.onMouseMove_ = this.onMouseMove_.bind(this);
          this.directionX = 0;
          this.directionY = 0;

          this.rotateStart_ = new THREE.Vector2(), this.rotateEnd_ = new THREE.Vector2(), this.rotateDelta_ = new THREE.Vector2(), this.isDragging_ = false;
        },
        play: function play() {
          window.addEventListener('mousemove', this.onMouseMove_);
          window.addEventListener('mousedown', this.onMouseDown_);
          window.addEventListener('mouseup', this.onMouseUp_);
        },
        pause: function pause() {
          window.addEventListener('mousemove', this.onMouseMove_);
          window.addEventListener('mousedown', this.onMouseDown_);
          window.addEventListener('mouseup', this.onMouseUp_);
        },
        isPointerLocked_: function isPointerLocked_() {
          var el = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
          return el !== undefined;
        },
        onMouseUp_: function onMouseUp_(e) {
          this.directionX = 0;
          this.isDragging_ = false;
        },
        onMouseDown_: function onMouseDown_(e) {
          this.rotateStart_.set(e.clientX, e.clientY);
          this.isDragging_ = true;
        },
        onMouseMove_: function onMouseMove_(e) {
          if (!this.isDragging_ && !this.isPointerLocked_()) {
            return;
          }
          if (!this.isPointerLocked_()) {
            var movementX = e.movementX || e.mozMovementX || 0;
            var movementY = e.movementY || e.mozMovementY || 0;
            this.rotateEnd_.set(this.rotateStart_.x - movementX, this.rotateStart_.y - movementY);
          } else {
            this.rotateEnd_.set(e.clientX, e.clientY);
          }
          this.rotateDelta_.subVectors(this.rotateEnd_, this.rotateStart_);
          this.rotateStart_.copy(this.rotateEnd_);

          this.directionX = movementX * this.data.speed;
        },
        tick: function tick(t, dt) {
          if (!this.data.enabled) {
            return;
          }
          var rotation = this.el.getAttribute('rotation');
          if (!rotation) {
            return;
          }
          if (this.directionX || this.directionY) {
            rotation.x += this.data.dx * this.directionY;
            rotation.y += this.data.dy * this.directionX;

            this.el.setAttribute('rotation', rotation);
          }
          if (this.data.speed !== this.schema.speed.default) this.data.speed = this.schema.speed.default;
        }
      });
    }
  }, {
    key: 'update',
    value: function update(value) {
      var _ref = void 0;
      if ((_ref = AFRAME.components[this.NAME]) != null && 10 > value ? _ref.schema != null : false) {
        _ref.schema.speed.default = value / 10;
      }
    }
  }]);
  return Mouse;
}();

var Aframe = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(Aframe, _akamai$amp$Plugin);

  function Aframe(player, config) {
    babelHelpers.classCallCheck(this, Aframe);

    var _this = babelHelpers.possibleConstructorReturn(this, (Aframe.__proto__ || Object.getPrototypeOf(Aframe)).call(this, player, config));

    _this.container = player.container;
    _this.scene = document.createElement("a-scene");
    _this.sphere = document.createElement("a-videosphere");
    _this.sky = document.createElement("a-sky"); // 360 poster image
    _this.scene.setAttribute("vr-mode-ui", "enabled: " + _this.isCompatible());
    _this.sphere.setAttribute("rotation", _this.config.data.rotation || "0 180 0");
    _this.pattern = typeof config.data.pattern != 'undefined' ? new RegExp(config.data.pattern, "i") : new RegExp("360", "i");
    _this.pattern = config.data.strict ? _this.pattern : new RegExp("", "i");

    if (config.mouse != null && config.mouse.speed) {
      _this.mouse = new Mouse(true, config.mouse.speed);
    }
    return _this;
  }

  babelHelpers.createClass(Aframe, [{
    key: "onready",
    value: function onready(event) {
      this.initComponent();
      this.player.addEventListener("mediachange", this.onMediaChangeHandler.bind(this));
    }
  }, {
    key: "onMediaChangeHandler",
    value: function onMediaChangeHandler() {
      var media = this.player.media !== null ? this.player.media : this.player.getMedia();
      var hasSphereElement = this.scene.getChildEntities().indexOf(this.sphere) > -1;
      var hasSkyElement = this.scene.getChildEntities().indexOf(this.sky) > -1;
      var category = typeof media.category != 'undefined' ? media.category : "";

      switch (media.medium) {
        case 'audio':
          this.sky.setAttribute("src", media.poster);
          this.scene.appendChild(this.sky);
          this.player.setDisplayState('aframe-sky');
          if (hasSphereElement) this.scene.removeChild(this.sphere);
          break;
        default:
          if (this.pattern.test(category)) {
            this.player.setDisplayState('aframe-sphere');
            if (hasSkyElement) this.scene.removeChild(this.sky);
            this.scene.appendChild(this.sphere);
          } else {
            this.player.setDisplayState('non-sphere');
            if (hasSphereElement) this.scene.removeChild(this.sphere);
          }
          break;
      }
    }
  }, {
    key: "initComponent",
    value: function initComponent() {
      this.player.mediaElement.setAttribute("id", "videoamp"); // adding id to video player for sphere src reference
      this.sphere.setAttribute("src", "#videoamp");
      this.sphere.setAttribute("mouse-rotation", '');
      this.scene.appendChild(this.sphere);

      var layer = document.createElement("div");
      layer.className = "amp-vr";
      layer.appendChild(this.scene);

      //append a-frame scene to player
      this.container.appendChild(layer);
    }
  }, {
    key: "updateMouseSpeed",
    value: function updateMouseSpeed(value) {
      if (this.mouse) {
        this.mouse.update(value);
      }
    }
  }, {
    key: "isCompatible",
    value: function isCompatible() {
      var compatible = typeof navigator.getVRDisplays == "function";
      if (compatible === false) {
        console.log("Your browser is not compatible with A-Frame check this page out https://get.webgl.org/");
      }
      return compatible;
    }
  }]);
  return Aframe;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("aframe", typeof akamai.amp.Plugin.createFactory == 'function' ? akamai.amp.Plugin.createFactory(Aframe) : Aframe.factory);

exports.Aframe = Aframe;

}((this.akamai.amp.aframe = this.akamai.amp.aframe || {})));
//# sourceMappingURL=Aframe.js.map
