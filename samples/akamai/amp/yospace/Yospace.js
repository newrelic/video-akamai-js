(function (exports) {
'use strict';

var YoSpace = function (_akamai$amp$AdPlugin) {
  babelHelpers.inherits(YoSpace, _akamai$amp$AdPlugin);

  function YoSpace(player, config) {
    babelHelpers.classCallCheck(this, YoSpace);

    var _this = babelHelpers.possibleConstructorReturn(this, (YoSpace.__proto__ || Object.getPrototypeOf(YoSpace)).call(this, player, config));

    _this.feature = "ads";
    _this.inProgress = false;

    _this.bindHandlers(["AdBreakStart", "AdBreakEnd", "AdvertStart", "AdvertEnd", "UpdateTimeline", "AnalyticsFired"]);

    YSSessionManager.DEFAULTS.DEBUGGING = _this.debug;
    _this.sdk = { YSSessionManager: YSSessionManager, YSPlayerEvents: YSPlayerEvents };

    _this.onclick = _this.onclick.bind(_this);

    // setup transforms
    if (config.transform !== false) {
      _this.player.addTransform(akamai.amp.TransformType.MEDIA, _this.mediaTransform.bind(_this));
    }
    return _this;
  }

  babelHelpers.createClass(YoSpace, [{
    key: "onready",
    value: function onready(event) {
      var _this2 = this;

      // TODO: This is a hack to get around the issue that hlsjs does not convert YoSpace ID3 tags into TextTrack DataCues
      if (this.player.hls) {
        this.player.hls.addEventListener("hlsFragParsingMetadata", function (event) {
          var data = event.detail.data;

          if (!data) return;

          var textTracks = _this2.player.textTracks;
          var textTrack = null;
          for (var i = 0, len = textTracks.length; i < len; i++) {
            if (textTracks[i].kind === "metadata") {
              textTrack = textTracks[i];
              break;
            }
          }

          if (textTrack == null) return;

          data.samples.forEach(function (sample) {
            var info = akamai.amp.Utils.arrayBufferToString(sample.data).replace(/\n|\r|ÿ/g, "");
            var regex = /(Y[A-Z]{3})([^Y]+)/g;
            if (!regex.test(info)) return;
            info.replace(regex, function (match, key, value) {
              var cue = new VTTCue(sample.pts, data.frag.endPTS, "");
              cue.type = "org.id3";
              cue.value = {
                key: key,
                value: key + value,
                info: value
              };
              textTrack.addCue(cue);
            });
          });
        });
      }
    }
  }, {
    key: "mediaTransform",
    value: function mediaTransform(media) {
      var _this3 = this;

      return this.createSession(media).then(function (url) {
        _this3.logger.log("[AMP YoSpace] Session Created", url);
        media.src = url;
        return media;
      });
    }
  }, {
    key: "createSession",
    value: function createSession(media) {
      var _this4 = this;

      var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return new Promise(function (resolve, reject) {
        // TODO: Do we need to implement createForNonLinear?
        var func = media.temporalType == "live" ? "createForLive" : "createForVoD";
        _this4.sessionManager = YSSessionManager[func](media.src, props, function (result) {
          if (result == "error") return reject("Could not create session");

          _this4.sessionManager.registerPlayer(_this4);

          resolve(_this4.sessionManager.masterPlaylist());
        });
      });
    }
  }, {
    key: "reportEvent",
    value: function reportEvent(event, detail) {
      if (this.sessionManager == null) return;
      this.sessionManager.reportPlayerEvent(event, detail);
    }
  }, {
    key: "AdBreakStart",
    value: function AdBreakStart() {
      // Function gets called whenever an advert break starts
      this.player.mediaElement.addEventListener("click", this.onclick);

      this.inProgress = true;

      // TODO: We need to figure out how to populate the AdVO object
      this.dispatch(akamai.amp.AdEvents.BREAK_START, new akamai.amp.AdVO());
    }
  }, {
    key: "AdvertStart",
    value: function AdvertStart(mediaId) {
      // Function gets called at the start of each advert within a break
      // (except for filler content - eg ident etc)

      this.dispatch(akamai.amp.AdEvents.STARTED, new akamai.amp.AdVO());
    }
  }, {
    key: "AdvertEnd",
    value: function AdvertEnd(mediaId) {
      // Function gets called at the end of each advert within a break
      // (except for filler content - eg ident etc)

      this.dispatch(akamai.amp.AdEvents.ENDED, new akamai.amp.AdVO());
    }
  }, {
    key: "AdBreakEnd",
    value: function AdBreakEnd() {
      // Function gets called at the end of an advert break signalling a return to main content
      this.player.mediaElement.removeEventListener("click", this.onclick);

      this.inProgress = false;
      this.dispatch(akamai.amp.AdEvents.BREAK_END, new akamai.amp.AdVO());
    }
  }, {
    key: "UpdateTimeline",
    value: function UpdateTimeline(timeline) {
      // Function gets called whenever there is updated information concerning the playback timeline
      // (for VoD and NonLinear content only)
      console.log("YoSpace -> UpdateTimeline", timeline);
    }
  }, {
    key: "AnalyticsFired",
    value: function AnalyticsFired(call_id, call_data) {
      // Function gets called whenever an analytics call is made by the SDK.
    }
  }, {
    key: "ontimeupdate",
    value: function ontimeupdate(event) {
      this.reportEvent(YSPlayerEvents.POSITION, event.detail);
    }
  }, {
    key: "onfullscreenchange",
    value: function onfullscreenchange(event) {
      this.reportEvent(YSPlayerEvents.FULLSCREEN, event.detail);
    }
  }, {
    key: "onmuted",
    value: function onmuted(event) {
      this.reportEvent(YSPlayerEvents.MUTE, event.detail);
    }
  }, {
    key: "ontimedmetadata",
    value: function ontimedmetadata(event) {
      var value = event.detail.value;

      if (!/^Y/.test(value.key)) return;

      if (this.id3 == null) {
        this.id3 = {};
      }

      this.id3[value.key] = value.info;

      var keys = Object.keys(this.id3);
      var diff = ["YCSP", "YDUR", "YMID", "YSEQ", "YTYP"].filter(function (i) {
        return !keys.includes(i);
      });

      if (diff.length === 0) {
        this.reportEvent(YSPlayerEvents.METADATA, this.id3);
        this.id3 = null;
      }
    }
  }, {
    key: "onmediasequencestarted",
    value: function onmediasequencestarted(event) {
      this.reportEvent(YSPlayerEvents.START);
    }
  }, {
    key: "onmediasequenceended",
    value: function onmediasequenceended(event) {
      this.reportEvent(YSPlayerEvents.END);
    }
  }, {
    key: "onpause",
    value: function onpause(event) {
      this.reportEvent(YSPlayerEvents.PAUSE);
    }
  }, {
    key: "onresume",
    value: function onresume(event) {
      this.reportEvent(YSPlayerEvents.RESUME);
    }
  }, {
    key: "onseeking",
    value: function onseeking(event) {
      this.reportEvent(YSPlayerEvents.SEEK_START, this.player.currentTime);
    }
  }, {
    key: "onseeked",
    value: function onseeked(event) {
      this.reportEvent(YSPlayerEvents.SEEK_END, this.player.currentTime);
    }
  }, {
    key: "onclick",
    value: function onclick() {
      this.reportEvent(YSPlayerEvents.CLICK);
    }
  }, {
    key: "nonlinear",
    value: function nonlinear() {
      var idx = null;
      this.reportEvent(YSPlayerEvents.NONLINEAR, idx);
    }
  }]);
  return YoSpace;
}(akamai.amp.AdPlugin);

akamai.amp.AMP.registerPlugin("yospace", akamai.amp.Plugin.createFactory(YoSpace));

exports.YoSpace = YoSpace;

}((this.akamai.amp.yospace = this.akamai.amp.yospace || {})));
//# sourceMappingURL=Yospace.js.map
