(function (exports) {
'use strict';

var Nielsen = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(Nielsen, _akamai$amp$Plugin);

  function Nielsen(player, config) {
    babelHelpers.classCallCheck(this, Nielsen);

    var _this = babelHelpers.possibleConstructorReturn(this, (Nielsen.__proto__ || Object.getPrototypeOf(Nielsen)).call(this, player, config));

    _this.bindHandlers(["onadstarted", "onadended", "onadtimeupdate"]);
    _this.sdk = window.NOLCMB.getInstance();

    var data = _this.data.data;
    _this.isDTVR = data.dtvr === true;
    _this.currentTime = 0;
    _this.sdk.ggInitialize(data);
    window.addEventListener("beforeunload", function () {
      return _this.fireBeacon("end", _this.currentTime.toFixed(0));
    });
    return _this;
  }

  babelHelpers.createClass(Nielsen, [{
    key: "generateNielsenVO",
    value: function generateNielsenVO(type) {
      var vo = {};
      var events = this.config.events;

      switch (type) {
        case "content":
          if (events.video != null) vo = events.video;
          break;

        case "static":
          vo = events.static;
          break;

        default:
          vo = events.ad;
          vo.type = type;
      }

      return vo;
    }
  }, {
    key: "fireBeacon",
    value: function fireBeacon(eventName, object) {
      var codes = {
        "loadmetadata": 15,
        "play": 5,
        "stop": 7,
        "timeupdate": 49,
        "end": 57,
        "sendID3": 55
      };

      this.player.logger.log("[AMP Nielsen DCR Event] : Event - " + eventName, object);
      this.sdk.ggPM(codes[eventName], object);
    }
  }, {
    key: "onready",
    value: function onready() {
      var target = this.player.ads;
      if (target != null) {
        target.addEventListener("onadstarted", this.onadstarted);
        target.addEventListener("onadended", this.onadended);
        target.addEventListener("onadtimeupdate", this.onadtimeupdate);
      }
    }
  }, {
    key: "onadstarted",
    value: function onadstarted(event) {
      this.adVO = event.detail;
      var type = this.adVO.type;

      if (type == "midroll" && this.adVO.position == 1) this.fireBeacon("stop", this.currentTime);

      if (type == "preroll") this.fireBeacon("loadmetadata", this.generateNielsenVO("content"));

      if (this.adVO != null) {
        this.fireBeacon("loadmetadata", this.generateNielsenVO(type));
      }
    }
  }, {
    key: "onadended",
    value: function onadended() {
      this.fireBeacon("stop", this.currentTime);
      if (this.adVO.type == "midroll" && this.adVO.totalAds == adVO.position) this.fireBeacon("loadmetadata", this.generateNielsenVO("content"));
    }
  }, {
    key: "onadtimeupdate",
    value: function onadtimeupdate(event) {
      var currentTime = Math.floor(event.detail);

      if (this.currentTime != currentTime) {
        this.currentTime = currentTime;
        this.fireBeacon("timeupdate", this.currentTime);
      }
    }
  }, {
    key: "onstarted",
    value: function onstarted() {
      if (this.adVO && this.adVO.type == "midroll") {
        this.fireBeacon("stop", this.generateNielsenVO(this.adVO.type));
      } else {
        this.fireBeacon("loadmetadata", this.generateNielsenVO("content"));
      }
    }
  }, {
    key: "onended",
    value: function onended() {
      this.fireBeacon("end", this.currentTime);
    }
  }, {
    key: "ontimeupdate",
    value: function ontimeupdate(event) {
      if (this.isDTVR === true) return;

      var currentTime = this.player.media.isLive ? event.detail : Date.now() / 1000;
      currentTime = Math.floor(currentTime);

      if (this.currentTime != currentTime) {
        this.currentTime = currentTime;
        this.fireBeacon("timeupdate", this.currentTime);
      }
    }
  }, {
    key: "onmediasequenceaborted",
    value: function onmediasequenceaborted() {
      this.fireBeacon("end", this.currentTime);
    }
  }, {
    key: "ontimedmetadata",
    value: function ontimedmetadata(event) {
      if (!this.isDTVR) return;
      this.fireBeacon("sendID3", event.data.value.info);
    }
  }]);
  return Nielsen;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("nielsen", akamai.amp.Plugin.createFactory(Nielsen));

exports.Nielsen = Nielsen;

}((this.akamai.amp.nielsen = this.akamai.amp.nielsen || {})));
//# sourceMappingURL=Nielsen.js.map
