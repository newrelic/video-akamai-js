(function (exports) {
'use strict';

var ChartbeatAnalyticsStrategy = function () {
  babelHelpers.createClass(ChartbeatAnalyticsStrategy, null, [{
    key: "verify",
    value: function verify() {
      return true;
    }
  }, {
    key: "ContentType",
    get: function get() {
      return {
        AD: "ad",
        CONTENT: "ct"
      };
    }
  }, {
    key: "AdPosition",
    get: function get() {
      return {
        PREROLL: "a1",
        MIDROLL: "a2",
        POSTROLL: "a3",
        OVERLAY: "a4",
        SPECIAL: "a5"
      };
    }
  }, {
    key: "VideoState",
    get: function get() {
      return {
        UNPLAYED: "s1",
        PLAYED: "s2",
        STOPPED: "s3",
        COMPLETED: "s4"
      };
    }
  }]);

  function ChartbeatAnalyticsStrategy(video) {
    babelHelpers.classCallCheck(this, ChartbeatAnalyticsStrategy);

    var player = video.amp;
    this.player = player;

    player.addEventListener("onmediachanged", this.onmediachanged.bind(this));
    player.addEventListener("onstarted", this.onstarted.bind(this));
    player.addEventListener("onplaying", this.onplaying.bind(this));
    player.addEventListener("onpaused", this.onpaused.bind(this));
    player.addEventListener("onended", this.onended.bind(this));

    var ads = player.ads;
    if (ads != null) {
      ads.addEventListener("started", this.onadstarted.bind(this));
      ads.addEventListener("ended", this.onadended.bind(this));
    }
  }

  babelHelpers.createClass(ChartbeatAnalyticsStrategy, [{
    key: "isReady",
    value: function isReady() {
      return this.isPlayerReady;
    }
  }, {
    key: "getTitle",
    value: function getTitle() {
      return this.player.media.title;
    }
  }, {
    key: "getVideoPath",
    value: function getVideoPath() {
      return this.player.src;
    }
  }, {
    key: "getContentType",
    value: function getContentType() {
      return this.contentType;
    }
  }, {
    key: "getAdPosition",
    value: function getAdPosition() {
      return this.adPosition;
    }
  }, {
    key: "getTotalDuration",
    value: function getTotalDuration() {
      return this.player.duration * 1000;
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.playbackState;
    }
  }, {
    key: "getCurrentPlayTime",
    value: function getCurrentPlayTime() {
      var currentTime = 0;

      if (this.player.media.isLive) {
        currentTime = Math.floor(Date.now() / 1000);
      } else {
        currentTime = this.player.currentTime.toFixed(1);
      }

      return currentTime;
    }
  }, {
    key: "getBitrate",
    value: function getBitrate() {
      return this.player.quality || NaN;
    }
  }, {
    key: "getThumbnailPath",
    value: function getThumbnailPath() {
      return this.player.media.poster;
    }
  }, {
    key: "getViewStartTime",
    value: function getViewStartTime() {
      return this.videoStartTime ? Math.round(Date.now() - this.videoStartTime) : 0;
    }
  }, {
    key: "onmediachanged",
    value: function onmediachanged() {
      this.playbackState = ChartbeatAnalyticsStrategy.VideoState.UNPLAYED;
      this.isPlayerReady = true;
    }
  }, {
    key: "onstarted",
    value: function onstarted() {
      this.contentType = ChartbeatAnalyticsStrategy.ContentType.CONTENT;
      this.videoStartTime = Date.now();
    }
  }, {
    key: "onplaying",
    value: function onplaying() {
      this.contentType = ChartbeatAnalyticsStrategy.ContentType.CONTENT;
      this.playbackState = ChartbeatAnalyticsStrategy.VideoState.PLAYED;
    }
  }, {
    key: "onended",
    value: function onended() {
      this.playbackState = ChartbeatAnalyticsStrategy.VideoState.COMPLETED;
      this.videoStartTime = null;
    }
  }, {
    key: "onpaused",
    value: function onpaused() {
      this.playbackState = ChartbeatAnalyticsStrategy.VideoState.STOPPED;
    }
  }, {
    key: "onadstarted",
    value: function onadstarted(event) {
      var adVO = event.detail;
      this.contentType = ChartbeatAnalyticsStrategy.ContentType.AD;

      if (adVO == null) return;

      if (adVO.type == "preroll") this.adPosition = ChartbeatAnalyticsStrategy.AdPosition.PREROLL;else if (adVO.type == "midroll") this.adPosition = ChartbeatAnalyticsStrategy.AdPosition.MIDROLL;else if (adVO.type == "postroll") this.adPosition = ChartbeatAnalyticsStrategy.AdPosition.POSTROLL;
    }
  }, {
    key: "onadended",
    value: function onadended(event) {
      var adVO = event.detail;
      if (adVO == null || adVO.type != "postroll") return;

      this.contentType = ChartbeatAnalyticsStrategy.ContentType.CONTENT;
    }
  }]);
  return ChartbeatAnalyticsStrategy;
}();

var ChartbeatAnalytics = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(ChartbeatAnalytics, _akamai$amp$Plugin);

  function ChartbeatAnalytics(player, config) {
    babelHelpers.classCallCheck(this, ChartbeatAnalytics);
    return babelHelpers.possibleConstructorReturn(this, (ChartbeatAnalytics.__proto__ || Object.getPrototypeOf(ChartbeatAnalytics)).call(this, player, config));
  }

  babelHelpers.createClass(ChartbeatAnalytics, [{
    key: "setConfigMetadata",
    value: function setConfigMetadata() {
      var config = window._sf_async_config = {};
      var data = this.data.data;

      if (data == null) return;

      for (var key in data) {
        var value = data[key];
        if (value == null || value == "null") continue;
        config[key] = value;
      }
    }
  }, {
    key: "onready",
    value: function onready() {
      window._cbv_strategies = window._cbv_strategies || [];
      window._cbv_strategies.push(ChartbeatAnalyticsStrategy);

      _cbv = window._cbv || (window._cbv = []);
      _cbv.push(this.player.mediaElement);

      this.player.loadResources(this.config.sdk);
    }
  }, {
    key: "onmediachange",
    value: function onmediachange() {
      this.setConfigMetadata();
    }
  }]);
  return ChartbeatAnalytics;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("chartbeatanalytics", akamai.amp.Plugin.createFactory(ChartbeatAnalytics));

exports.ChartbeatAnalytics = ChartbeatAnalytics;

}((this.akamai.amp.chartbeatanalytics = this.akamai.amp.chartbeatanalytics || {})));
//# sourceMappingURL=Chartbeatanalytics.js.map
