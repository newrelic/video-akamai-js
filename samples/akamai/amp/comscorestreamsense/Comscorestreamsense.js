(function (exports) {
'use strict';

var ComscoreStreamsense = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(ComscoreStreamsense, _akamai$amp$Plugin);

  function ComscoreStreamsense(player, config) {
    babelHelpers.classCallCheck(this, ComscoreStreamsense);

    var _this = babelHelpers.possibleConstructorReturn(this, (ComscoreStreamsense.__proto__ || Object.getPrototypeOf(ComscoreStreamsense)).call(this, player, config));

    _this.sdk = akamai["amp"].ns_;
    // Initialize the Comscore Streamsense SDK with CLient ID
    // TODO: Why do we create the streaming tag here? It gets create when new media is loaded
    if (_this.sdk != null && _this.streamingTag == null) _this.createStreamingTag();
    return _this;
  }

  babelHelpers.createClass(ComscoreStreamsense, [{
    key: "onready",
    value: function onready() {
      var ads = this.player.ads;
      if (ads == null) return;

      this.bindHandlers(["stop", "onadstarted", "onaderror"]);
      ads.addEventListener("started", this.onadstarted);
      ads.addEventListener("ended", this.stop);
      ads.addEventListener("skipped", this.stop);
      ads.addEventListener("error", this.onaderror);
    }
  }, {
    key: "createStreamingTag",
    value: function createStreamingTag() {
      if (this.streamingTag != null) this.streamingTag.stop();
      this.streamingTag = null;
      this.streamingTag = new this.sdk.StreamingTag({ customerC2: this.config.clientId });
    }

    /* Get MetaData */

  }, {
    key: "getMetaData",
    value: function getMetaData() {
      var ads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var metadata = {};
      var object = ads ? this.data.metadata.ads : this.data.metadata.video;
      for (var key in object) {
        var value = object[key];
        if (value == "null" || value == null) continue;
        metadata[key] = value;
      }
      return metadata;
    }
  }, {
    key: "onmediachange",
    value: function onmediachange() {
      this.createStreamingTag();
      this.logger.log("[AMP ComscoreStreamsense Event] Media Change, StreamTag ReInitialize");
    }

    /* Media Started */

  }, {
    key: "onplaying",
    value: function onplaying() {
      /* Play Beacon */
      var ads = this.player.ads;
      if (ads != null && (ads.getInProgress() || ads.inProgress)) return;
      this.streamingTag.playVideoContentPart(this.getMetaData());
      this.logger.log("[AMP ComscoreStreamsense Event] Content Play");
    }
  }, {
    key: "onpaused",
    value: function onpaused() {
      this.stop();
    }

    /* Media Stop */

  }, {
    key: "stop",
    value: function stop() {
      this.streamingTag.stop();
    }

    /* Media Ended */

  }, {
    key: "onended",
    value: function onended() {
      /* MediaStop Ended */
      // TODO: Why do we create the streaming tag here? It gets create when new media is loaded
      //       Shouldn't this just be a call to stop?
      this.createStreamingTag();
      this.logger.log("[AMP ComscoreStreamsense Event] End");
    }
  }, {
    key: "onadstarted",
    value: function onadstarted() {
      this.streamingTag.playVideoAdvertisement(this.getMetaData(true));
      this.logger.log("[AMP ComscoreStreamsense Event] : Ad Start");
    }
  }, {
    key: "onaderror",
    value: function onaderror() {
      this.onadstarted();
      this.stop();
    }
  }]);
  return ComscoreStreamsense;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("comscorestreamsense", akamai.amp.Plugin.createFactory(ComscoreStreamsense));

exports.ComscoreStreamsense = ComscoreStreamsense;

}((this.akamai.amp.comscorestreamsense = this.akamai.amp.comscorestreamsense || {})));
//# sourceMappingURL=Comscorestreamsense.js.map
