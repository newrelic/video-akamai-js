(function (exports) {
'use strict';

var MediaAnalytics = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(MediaAnalytics, _akamai$amp$Plugin);

  function MediaAnalytics(player, config) {
    babelHelpers.classCallCheck(this, MediaAnalytics);

    var _this = babelHelpers.possibleConstructorReturn(this, (MediaAnalytics.__proto__ || Object.getPrototypeOf(MediaAnalytics)).call(this, player, config));

    _this.akamaiLibrary = new JS_AkamaiMediaAnalytics(config.config);
    _this.akamaiLibrary.disableLocation();
    _this.akamaiLibraryInitialised = false;
    return _this;
  }

  babelHelpers.createClass(MediaAnalytics, [{
    key: "setDimensions",
    value: function setDimensions(value) {
      var dimensions = this.config.dimensions;
      for (var key in value) {
        var val = value[key];
        if (val != null) {
          dimensions[key] = val; // TODO: Does this need to be evaluated for bindings?
        }
      }
      this.applyDimensions(dimensions);
      return value;
    }
  }, {
    key: "amaCallbacks",
    value: function amaCallbacks(playerInstance) {
      this.getStreamHeadPosition = function () {
        if (playerInstance) {
          return playerInstance.getCurrentTime();
        }
      };
    }
  }, {
    key: "applyDimensions",
    value: function applyDimensions(dimensions) {
      try {
        for (var key in dimensions) {
          this.akamaiLibrary.setData(key, this.player.evaluateBindings(dimensions[key]));
        }
      } catch (error) {
        this.player.logger.error("[AMP MEDIA ANALYTICS ERROR]", "Could not set dimensions:", error);
      }
    }
  }, {
    key: "onready",
    value: function onready(event) {
      //this.akamaiLibrary.enableDebugLogging(this.debug)

      var ads = this.player.ads;
      if (ads == null) return;

      ads.addEventListener("breakstart", this.onadbreakstart.bind(this));
      ads.addEventListener("breakend", this.onadbreakend.bind(this));
      ads.addEventListener("loaded", this.onadloaded.bind(this));
      ads.addEventListener("started", this.onadstarted.bind(this));
      ads.addEventListener("ended", this.onadended.bind(this));
      ads.addEventListener("skipped", this.onadbreakskipped.bind(this));
      ads.addEventListener("error", this.onaderror.bind(this));

      ads.addEventListener("firstquartile", this.onadfirstquartile.bind(this));
      ads.addEventListener("midpoint", this.onadmidpoint.bind(this));
      ads.addEventListener("thirdquartile", this.onadthirdquartile.bind(this));
    }
  }, {
    key: "onplayrequest",
    value: function onplayrequest(event) {
      if (this.akamaiLibraryInitialised == false) {
        this.player.logger.log("[AMP MA EVENT] - handleSessionInit");
        this.akamaiLibrary.handleSessionInit(new this.amaCallbacks(this.player));
        this.akamaiLibraryInitialised = true;
      }
    }
  }, {
    key: "onmediasequenceended",
    value: function onmediasequenceended(event) {
      this.player.logger.log("[AMP MA EVENT] - handlePlayEnd");
      this.akamaiLibrary.handlePlayEnd();
    }
  }, {
    key: "onplaying",
    value: function onplaying(event) {
      if (this.player.ads != null && this.player.ads.inProgress) return;
      this.player.logger.log("[AMP MA EVENT] - handlePlaying");
      this.akamaiLibrary.handlePlaying();
    }
  }, {
    key: "onmediachange",
    value: function onmediachange(event) {
      var media = event.detail;
      var dimensions = null;

      this.akamaiLibraryInitialised = false;
      this.player.logger.log("[AMP MA EVENT] - setStreamURL", media.src);
      this.akamaiLibrary.setStreamURL(media.src, true);

      var viewerId = this.config.viewerId || this.config.viewerID || this.config["std:viewerId"];
      if (viewerId != null) {
        this.akamaiLibrary.setViewerId(viewerId);
      }

      var config = media.mediaanalytics;
      if (config != null && config.dimensions != null) {
        dimensions = akamia.amp.Utils.override(this.config.dimensions, config.dimensions);
      } else {
        dimensions = this.config.dimensions;
      }

      //this.akamaiLibrary.handleStreamSwitch()
      this.applyDimensions(dimensions);
    }
  }, {
    key: "ondurationchange",
    value: function ondurationchange(duaration) {
      this.player.logger.log("[AMP MA EVENT] - setStreamDuration", duaration.data);
      this.akamaiLibrary.setStreamDuration(duaration.data);
    }
  }, {
    key: "updateMedia",
    value: function updateMedia(media) {
      this.player.logger.log("[AMP MA EVENT] - handleTitleSwitch");
      this.akamaiLibrary.handleTitleSwitch(media);
    }
  }, {
    key: "onfragmentloadstart",
    value: function onfragmentloadstart(event) {
      if (typeof fragmentDownloadStarted === "function") {
        fragmentDownloadStarted(event.detail);
      }
    }
  }, {
    key: "onadbreakstart",
    value: function onadbreakstart() {
      this.player.mediaElement.dataset.isad = true;
    }
  }, {
    key: "onadbreakend",
    value: function onadbreakend() {
      this.player.mediaElement.dataset.isad = false;
    }
  }, {
    key: "onadloaded",
    value: function onadloaded(event) {
      try {
        var adVO = event.data;
        var adObject = {
          adTitle: adVO.title,
          adDuration: adVO.duration,
          adPartnerId: adVO.partner,
          adId: adVO.id
        };
        this.player.logger.log("[AMP MA EVENT] - handleAdLoaded");
        this.akamaiLibrary.handleAdLoaded(adObject);
      } catch (error) {
        this.player.logger.error("[AMP MEDIA ANALYTICS ERROR]", error);
      }
    }
  }, {
    key: "onadstarted",
    value: function onadstarted() {
      this.player.logger.log("[AMP MA EVENT] - handleAdStarted");
      this.akamaiLibrary.handleAdStarted();
    }
  }, {
    key: "onadbreakskipped",
    value: function onadbreakskipped() {
      this.player.logger.log("[AMP MA EVENT] - handleAdSkipped");
      this.akamaiLibrary.handleAdSkipped();
    }
  }, {
    key: "onaderror",
    value: function onaderror(event) {
      this.player.logger.log("[AMP MA EVENT] - handleAdError");
      this.akamaiLibrary.handleAdError(event);
    }
  }, {
    key: "onadfirstquartile",
    value: function onadfirstquartile() {
      this.player.logger.log("[AMP MA EVENT] - handleAdFirstQuartile");
      this.akamaiLibrary.handleAdFirstQuartile();
    }
  }, {
    key: "onadmidpoint",
    value: function onadmidpoint() {
      this.player.logger.log("[AMP MA EVENT] - handleAdMidPoint");
      this.akamaiLibrary.handleAdMidPoint();
    }
  }, {
    key: "onadthirdquartile",
    value: function onadthirdquartile() {
      this.player.logger.log("[AMP MA EVENT] - handleAdThirdQuartile");
      this.akamaiLibrary.handleAdThirdQuartile();
    }
  }, {
    key: "onadended",
    value: function onadended() {
      this.player.logger.log("[AMP MA EVENT] - handleAdComplete");
      this.akamaiLibrary.handleAdComplete();
    }
  }, {
    key: "onpause",
    value: function onpause() {
      this.player.logger.log("[AMP MA EVENT] - handlePause");
      this.akamaiLibrary.handlePause();
    }
  }, {
    key: "onseeking",
    value: function onseeking() {
      if (this.player.currentTime > 0.1 || this.player.currentTime === 0) {
        this.akamaiLibrary.handleSeekStart();
        this.player.logger.log("[AMP MA EVENT] - handleSeekStart");
      }
    }
  }, {
    key: "onseeked",
    value: function onseeked() {
      if (this.player.currentTime > 0.1 || this.player.currentTime === 0) {
        this.akamaiLibrary.handleSeekEnd();
        this.player.logger.log("[AMP MA EVENT] - handleSeekEnd");
      }
    }
  }, {
    key: "onerror",
    value: function onerror(event) {
      this.player.logger.log("[AMP MA EVENT] - handleError", event.detail);
      this.akamaiLibrary.handleError(event.detail);
    }
  }, {
    key: "onbufferingchange",
    value: function onbufferingchange(event) {
      this.player.logger.log("[AMP MA EVENT] - handleBufferStart", event.detail);
      if (event.detail === true) this.akamaiLibrary.handleBufferStart();else this.akamaiLibrary.handleBufferEnd();
    }
  }, {
    key: "onqualitychanged",
    value: function onqualitychanged(event) {
      this.player.logger.log("[AMP MA EVENT] - handleBitRateSwitch", event.data.bitrate);
      this.akamaiLibrary.handleBitRateSwitch(event.data.bitrate);
    }
  }]);
  return MediaAnalytics;
}(akamai.amp.Plugin);

var MediaAnalyticsFlash = function (_akamai$amp$FlashPlug) {
  babelHelpers.inherits(MediaAnalyticsFlash, _akamai$amp$FlashPlug);

  function MediaAnalyticsFlash(player, config) {
    babelHelpers.classCallCheck(this, MediaAnalyticsFlash);
    return babelHelpers.possibleConstructorReturn(this, (MediaAnalyticsFlash.__proto__ || Object.getPrototypeOf(MediaAnalyticsFlash)).call(this, player, config));
  }

  babelHelpers.createClass(MediaAnalyticsFlash, [{
    key: "setDimensions",
    value: function setDimensions(value) {
      this.player.mediaElement.setPlayerProperty("maDimensions", value);
      return value;
    }
  }, {
    key: "createFlashVars",
    value: function createFlashVars(event) {
      var flashvars = event.detail.flashvars;
      var dimensions = this.player.config && this.player.config.media && this.player.config.media.mediaanalytics;

      if (dimensions != null) {
        for (var key in dimensions) {
          flashvars["report_" + key] = dimensions[key];
        }
      }
    }
  }, {
    key: "createXML",
    value: function createXML(event) {
      var xml = event.detail.xml;
      var application = xml.firstChild;
      var metrics = xml.getElementsByTagName("metrics")[0];
      var element = null;

      if (metrics == null) {
        metrics = xml.createElement("metrics");
        application.appendChild(metrics);
      }

      var vendor = xml.createElement("vendor");
      vendor.setAttribute("id", "akamai");
      metrics.appendChild(vendor);

      if (this.config.config != null) {
        this.createProperty(xml, "MEDIA_ANALYTICS_BEACON", this.config.config, vendor);

        var path = this.config.plugin.swf || "http://79423.analytics.edgesuite.net/csma/plugin/csma.swf";
        this.createProperty(xml, "MEDIA_ANALYTICS_PLUGIN_PATH", path, vendor);
      }

      if (this.config.dimensions != null) {
        this.createProperty(xml, "dimensions", this.config.dimensions, vendor);
      }
    }
  }, {
    key: "onmediachange",
    value: function onmediachange(event) {
      var media = event.detail;
      if (media.mediaanalytics && media.mediaanalytics.dimensions) {
        media.dimensions = [];
        for (var key in media.mediaanalytics.dimensions) {
          media.dimensions.push({ key: key, value: media.mediaanalytics.dimensions[key] });
        }
      }
    }
  }, {
    key: "flashPlugins",
    get: function get() {
      return [{
        id: "OSMFCSMALoader",
        host: "osmf",
        main: "com.akamai.playeranalytics.osmf.OSMFCSMALoaderInfo",
        type: "application/x-shockwave-flash"
      }];
    }
  }]);
  return MediaAnalyticsFlash;
}(akamai.amp.FlashPlugin);

akamai.amp.AMP.registerPlugin("mediaanalytics", "html", akamai.amp.Plugin.createFactory(MediaAnalytics));
akamai.amp.AMP.registerPlugin("mediaanalytics", "flash", akamai.amp.Plugin.createFactory(MediaAnalyticsFlash));

exports.MediaAnalytics = MediaAnalytics;

}((this.akamai.amp.mediaanalytics = this.akamai.amp.mediaanalytics || {})));
//# sourceMappingURL=Mediaanalytics.js.map
