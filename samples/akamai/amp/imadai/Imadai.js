(function (exports) {
'use strict';

var DAI = function (_akamai$amp$AdPlugin) {
  babelHelpers.inherits(DAI, _akamai$amp$AdPlugin);

  function DAI(player, config) {
    babelHelpers.classCallCheck(this, DAI);

    var _this = babelHelpers.possibleConstructorReturn(this, (DAI.__proto__ || Object.getPrototypeOf(DAI)).call(this, player, config));

    _this.feature = "ads";
    _this.inProgress = false;
    _this.streamManager = null;
    _this.currentAd = null;
    _this.adTimeRemaining = null;
    _this.snapForwardTime = null;

    _this.onAdEvent = _this.onAdEvent.bind(_this);

    // setup transforms
    if (config.transform !== false) {
      var _this$transforms;

      _this.transforms = (_this$transforms = {}, babelHelpers.defineProperty(_this$transforms, akamai.amp.TransformType.MEDIA, { transform: _this.mediaTransform.bind(_this), priority: 1 }), babelHelpers.defineProperty(_this$transforms, akamai.amp.TransformType.TIME, _this.timeTransform.bind(_this)), babelHelpers.defineProperty(_this$transforms, akamai.amp.TransformType.SEEK, _this.seekTransform.bind(_this)), _this$transforms);

      for (var key in _this.transforms) {
        _this.player.addTransform(key, _this.transforms[key]);
      }
    }
    return _this;
  }

  babelHelpers.createClass(DAI, [{
    key: "mediaTransform",
    value: function mediaTransform(media) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        // choose the correct request object
        var isLive = media.temporalType == "live";
        var streamRequest = isLive ? new google.ima.dai.api.LiveStreamRequest() : new google.ima.dai.api.VODStreamRequest();

        // the DAI params can come in from a number of sources
        var metadata = media.metadata ? media.metadata.media || media.metadata : {};
        var config = _this2.player.evaluateBindings(_this2.config, { media: media });
        var source = akamai.amp.Utils.getSourceByType(media, "application/x-mpegURL");
        if (source == null) return reject("Could not find media");
        source = _this2.player.evaluateBindings(source, { media: media });

        function getProperty(name, dflt) {
          return source[name] || metadata[name] || config[name] || dflt;
        }

        // init the stream request
        streamRequest.adTagParameters = getProperty("adTagParameters");
        streamRequest.streamActivityMonitorId = getProperty("streamActivityMonitorId");
        streamRequest.apiKey = getProperty("apiKey", "");

        if (isLive) {
          var assetKey = getProperty("assetKey");

          if (!assetKey) return resolve(media);

          streamRequest.assetKey = assetKey;
          streamRequest.attemptPreroll = getProperty("attemptPreroll", true);

          _this2.player.addEventListener(akamai.amp.Events.TIMED_METADATA, function (event) {
            var cue = event.detail;
            if (_this2.streamManager && cue) {
              _this2.streamManager.onTimedMetadata({ "TXXX": cue.value.data });
            }
          });
        } else {
          var videoId = getProperty("videoId");
          var contentSourceId = getProperty("contentSourceId");

          if (!contentSourceId) return resolve(media);

          streamRequest.contentSourceId = contentSourceId;
          streamRequest.videoId = videoId;
        }

        // listen for stream request events
        var onStreamEvent = function onStreamEvent(event) {
          _this2.logger.log("[AMP IMA DAI] Stream Event: " + event.type, event);
          _this2.streamManager.removeEventListener([google.ima.dai.api.StreamEvent.Type.LOADED, google.ima.dai.api.StreamEvent.Type.ERROR], onStreamEvent, false);

          switch (event.type) {
            case google.ima.dai.api.StreamEvent.Type.LOADED:
              // override the media's src property with the url provided by DAI
              media.src = event.getStreamData().url;
              //this.player.timeline = new Timeline(this.streamManager, this.player.mediaElement)
              _this2.logger.log("[AMP IMA DAI] Media Source Fetched " + media.src);
              break;
            case google.ima.dai.api.StreamEvent.Type.ERROR:
              _this2.logger.log("[AMP IMA DAI] Media Source Fetch Error", event);
              break;
          }
          resolve(media);
        };

        _this2.streamManager.addEventListener([google.ima.dai.api.StreamEvent.Type.LOADED, google.ima.dai.api.StreamEvent.Type.ERROR], onStreamEvent, false);

        // make the stream request
        _this2.streamManager.requestStream(streamRequest);
      });
    }
  }, {
    key: "timeTransform",
    value: function timeTransform(time) {
      return this.streamManager.contentTimeForStreamTime(time);
    }
  }, {
    key: "seekTransform",
    value: function seekTransform(time) {
      return this.streamManager.streamTimeForContentTime(time);
    }
  }, {
    key: "onready",
    value: function onready() {
      this.logger.log("[AMP IMA DAI] SDK initialize");

      // create the stream manager
      this.streamManager = new google.ima.dai.api.StreamManager(this.player.mediaElement);

      if (this.player.ui && this.player.ui.ads && this.player.ui.container) this.streamManager.setClickElement(this.player.ui.ads.container);

      // listen for all available events
      var events = [];
      for (var event in google.ima.dai.api.StreamEvent.Type) {
        if (google.ima.dai.api.StreamEvent.Type.hasOwnProperty(event)) {
          events.push(google.ima.dai.api.StreamEvent.Type[event]);
        }
      }
      this.streamManager.addEventListener(events, this.onAdEvent, false);
    }
  }, {
    key: "onmediachange",
    value: function onmediachange() {
      this.inProgress = false;
    }
  }, {
    key: "onAdEvent",
    value: function onAdEvent(event) {
      this.logger.log("[AMP IMA DAI] Event: " + event.type, event);
      switch (event.type) {
        case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
          this.adBreakStart(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
          this.adBreakEnd(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.STARTED:
          this.adStarted(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.COMPLETE:
          this.adEnded(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.AD_PROGRESS:
          this.adProgress(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.CLICK:
          this.adClick(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE:
          this.adFirstQuartile(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.MIDPOINT:
          this.adMidpoint(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE:
          this.adThirdQuartile(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.CUEPOINTS_CHANGED:
          this.cuePointsChanged(event);
          break;
        case google.ima.dai.api.StreamEvent.Type.ERROR:
          this.adError(event);
          break;
      }
    }
  }, {
    key: "adBreakStart",
    value: function adBreakStart(event) {
      this.inProgress = true;
      this.dispatch(akamai.amp.AdEvents.BREAK_START);
    }
  }, {
    key: "adStarted",
    value: function adStarted(event) {
      if (this.inProgress == false) this.adBreakStart();

      var ad = event.getAd();
      var companionAds = ad.getCompanionAds();
      var adPodInfo = ad.getAdPodInfo();
      var adPosition = adPodInfo.getAdPosition();
      var adPodIndex = adPodInfo.getPodIndex();
      var adType = adPodIndex == 0 ? "preroll" : adPodIndex == -1 ? "postroll" : "midroll";

      this.currentAd = new akamai.amp.AdVO(ad.getAdId(), ad.getTitle(), ad.getDuration(), adPosition, adType, "ima-dai", null, companionAds, null, ad, adPodInfo.getTotalAds());
      this.companions = companionAds;
      this.dispatch(akamai.amp.AdEvents.LOADED, this.currentAd);
      this.dispatch(akamai.amp.AdEvents.DURATION_CHANGE, this.currentAd);
      this.dispatch(akamai.amp.AdEvents.STARTED, this.currentAd);
    }
  }, {
    key: "adFirstQuartile",
    value: function adFirstQuartile(event) {
      this.dispatch(akamai.amp.AdEvents.FIRST_QUARTILE, this.currentAd);
    }
  }, {
    key: "adMidpoint",
    value: function adMidpoint(event) {
      this.dispatch(akamai.amp.AdEvents.MIDPOINT, this.currentAd);
    }
  }, {
    key: "adThirdQuartile",
    value: function adThirdQuartile(event) {
      this.dispatch(akamai.amp.AdEvents.THIRD_QUARTILE, this.currentAd);
    }
  }, {
    key: "adEnded",
    value: function adEnded(event) {
      this.dispatch(akamai.amp.AdEvents.ENDED, this.currentAd);
    }
  }, {
    key: "adBreakEnd",
    value: function adBreakEnd(event) {
      this.inProgress = false;
      this.dispatch(akamai.amp.AdEvents.BREAK_END);
      if (this.snapForwardTime && this.snapForwardTime > this.player.mediaElement.currentTime) {
        this.player.mediaElement.currentTime = this.snapForwardTime;
        this.snapForwardTime = null;
      }
    }
  }, {
    key: "adProgress",
    value: function adProgress(event) {
      var adProgressData = event.getStreamData().adProgressData;
      var currentTime = adProgressData.currentTime;
      var duration = adProgressData.duration;

      this.dispatch(akamai.amp.AdEvents.TIME_UPDATE, currentTime);
      this.dispatch(akamai.amp.AdEvents.TIME_REMAINING, Math.floor(duration - currentTime));
    }
  }, {
    key: "adClick",
    value: function adClick(event) {
      if (!this.player.paused) this.player.pause();

      this.dispatch(akamai.amp.AdEvents.CLICKED, this.currentAd);
    }
  }, {
    key: "adError",
    value: function adError(event) {
      this.dispatch(akamai.amp.AdEvents.ERROR, event.getStreamData().errorMessage);
    }
  }, {
    key: "cuePointsChanged",
    value: function cuePointsChanged(event) {
      var _this3 = this;

      try {
        var cues = [];
        event.getStreamData().cuepoints.forEach(function (cue) {
          cues.push({ "startTime": _this3.streamManager.contentTimeForStreamTime(cue.start) });
        });
        if (cues.length) this.player.cues = cues;
      } catch (error) {}
    }
  }, {
    key: "onseeked",
    value: function onseeked(event) {
      var currentTime = this.player.mediaElement.currentTime;
      var previousCuePoint = this.streamManager.previousCuePointForStreamTime(currentTime);
      if (previousCuePoint && !previousCuePoint.played) {
        this.snapForwardTime = currentTime;
        this.player.mediaElement.currentTime = previousCuePoint.start;
      }
    }
  }]);
  return DAI;
}(akamai.amp.AdPlugin);

akamai.amp.AMP.registerPlugin("imadai", akamai.amp.Plugin.createFactory(DAI));

exports.DAI = DAI;

}((this.akamai.amp.imadai = this.akamai.amp.imadai || {})));
//# sourceMappingURL=Imadai.js.map
