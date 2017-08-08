let fs = require('fs')
let path = require('path');
let jsdom = require('jsdom');

let pausingDuringAnAd = () => {
}


describe('New Relic Video Plugin', () => {
  let config = {};
  //let player = {
    //addEventListener: function (fn) { eventListeners.push(fn) }
  //};


  global.akamai = {
    amp: {
      AMP: {
        registerPlugin: function (name, fn) {
          //fn(player, config);
        }
      }
    }
  }

  global.amp = {
    evaluateBinding: function (obj) { return obj }
  }

  let instance;
  let NewRelic;
  let eventListeners;
  let pageActionMock;
  let player;
  let window;

  beforeEach(() => {
    pageActionMock = jest.fn();
    eventListeners = [];

    var document = jsdom.jsdom(`<p> <video /> </p>`);
    window = document.defaultView;

    var bodyEl = document.body; // implicitly created
    player = document.querySelector("video");
    player.initTime = (new Date().getTime());

    let adEvents = [];

    player.ads = {
      dispatchEvent: (event) => {
        let keys = adEvents.map((x) => Object.keys(x)[0]);
        let index = keys.indexOf(event.type)
        if (index >= 0) adEvents[index][event.type](event.detail)
        else player.dispatchEvent(event)
      },
      addEventListener: (key, value) => {
        let tmp = {}
        tmp[key] = value.bind(this);
        adEvents.push(tmp);
      }
    }

    this.akamai = {
      amp: {
      }
    }

    let nr = fs.readFileSync(path.resolve(__dirname, './NewRelic.js'), 'utf8');
    let _ = function (nr) { eval(nr) }.call(this, nr);
    NewRelic = this.akamai.amp.newrelic.NewRelic;
    instance = new NewRelic(player, config);
    instance.pageAction = pageActionMock
  })

  describe('playHandler', () => {
    test('Calls PLAYBACK_START the first time playHander is called', () => {
      instance.playHandler();
      expect(pageActionMock).toHaveBeenCalled();
      expect(pageActionMock.mock.calls[0][0]).toBe('PLAYBACK_START');
    });

    test('Calls PLAYBACK_RESUMED the second time playHander is called', () => {
      instance.playHandler();
      instance.playHandler();
      expect(pageActionMock).toBeCalledWith('PLAYBACK_RESUMED');
    });

    test('Calls PLAYBACK_SEEK_COMPLETE if the video was seeking', () => {
      instance.isSeeking = (new Date().getTime());
      instance.playHandler();
      expect(pageActionMock).toBeCalledWith('PLAYBACK_SEEK_COMPLETE', expect.anything());
      expect(pageActionMock).toBeCalledWith('PLAYBACK_START');
    })
  });

  describe('readyHandler', () => {
    test('Calls PLAYER_READY', () => {
      instance.readyHandler()
      expect(pageActionMock).toBeCalledWith('PLAYER_READY', expect.anything())
    });

    test('We should capture the diff between init and ready', () => {
      instance.readyHandler()
      expect(pageActionMock).toBeCalledWith('PLAYER_READY', expect.objectContaining({readyTime: instance.readyTime, timeToReady: instance.readyTime - player.initTime}))
    });

    test('Should set up a handler for playing', () => {
      let playHanderMock = jest.fn();
      instance.playHandler = playHanderMock;
      instance.readyHandler()

      var playing = new window.Event('playing')
      player.dispatchEvent(playing);

      expect(playHanderMock).toHaveBeenCalled()
    })
  });

  describe('Time to seek', () => {
    test('should trigger PLAYBACK_SEEK_START on a start of a seek', () => {
      instance.readyHandler()

      var seeking = new window.Event('seeking')
      player.dispatchEvent(seeking);

      expect(pageActionMock).toBeCalledWith('PLAYBACK_SEEK_START')
    })

    test('should track the time it takes to seek', () => {
      instance.readyHandler()

      var seeking = new window.Event('seeking')
      player.dispatchEvent(seeking);

      var playing = new window.Event('playing')
      player.dispatchEvent(playing);

      expect(pageActionMock).toBeCalledWith('PLAYBACK_SEEK_COMPLETE', expect.objectContaining({ timeToSeek: expect.any(Number) }))
    })
  })

  describe('First frame', () => {
    describe('for ads', () => {
      test('we should capture the diff between request and first frame', () => {

        instance.readyHandler()

        var playrequest = new window.Event('request')
        player.ads.dispatchEvent(playrequest);

        var started = new window.Event('playing')
        player.ads.dispatchEvent(started);

        expect(pageActionMock).toBeCalledWith('FIRST_FRAME', expect.objectContaining({ timeToFirstFrame: expect.any(Number) }))
        expect(pageActionMock).toBeCalledWith('CONTENT_STARTED', expect.objectContaining({ timeToContent: expect.any(Number) }))
      })
    })

    describe('for content', () => {
      test('we should capture the diff between request and first frame', () => {
        instance.readyHandler()

        var playrequest = new window.Event('playrequest')
        player.dispatchEvent(playrequest);

        var started = new window.Event('playing')
        player.dispatchEvent(started);

        expect(pageActionMock).toBeCalledWith('FIRST_FRAME', expect.objectContaining({ timeToFirstFrame: expect.any(Number) }))
        expect(pageActionMock).toBeCalledWith('CONTENT_STARTED', expect.objectContaining({ timeToContent: expect.any(Number) }))
      });

      test('FIRST_FRAME should only fire once', () => {
        instance.readyHandler()

        let eventTypes = ['playrequest', 'playing', 'playrequest', 'playing']
        eventTypes.forEach((eventType) => {
          var event = new window.Event(eventType)
          player.dispatchEvent(event);
        })

        let content_started_called = pageActionMock.mock.calls.filter((m) => m[0] === 'FIRST_FRAME')
        expect(content_started_called.length).toBe(1)
      });
    });

  }); //describe(first frame)

  describe('pausing', () => {

    describe('in content', () => {
      let pauseAndPlay = () => {
        let eventTypes = ['pause', 'paused', 'playstatechange', 'resume', 'play', 'playstatechange', 'playing', 'ended']
        eventTypes.forEach((eventType) => {
          var event = new window.Event(eventType)
          player.dispatchEvent(event);
        })
      }

      test('should record a PLAYBACK_PAUSED action', () => {
        instance.readyHandler()
        pauseAndPlay();

        expect(pageActionMock).toBeCalledWith('PLAYBACK_PAUSED')
      })

      test('should record a PLAYBACK_RESUMED action', () => {
        instance.readyHandler()
        pauseAndPlay();

        expect(pageActionMock).toBeCalledWith('PLAYBACK_RESUMED')
      })
    })

    describe('in an ad', () => {

      let pauseAndPlay = () => {
        let eventTypes = ['pause', 'paused', 'playstatechange', 'resume', 'play', 'playstatechange', 'playing', 'ended']
        eventTypes.forEach((eventType) => {
          var event = new window.Event(eventType)
          player.ads.dispatchEvent(event);
        })
      }

      test('should record a AD_PAUSED action', () => {
        instance.readyHandler()
        pauseAndPlay();

        expect(pageActionMock).toBeCalledWith('AD_PAUSED')
      })
      test('should record a AD_RESUMED action', () => {
        instance.readyHandler()
        pauseAndPlay();

        expect(pageActionMock).toBeCalledWith('AD_RESUMED')
      })
    })
  }) //describe('pausing')
  describe('elaborate pausing', () => {
    beforeEach(() => {

      let triggerAd = () => {
        let eventTypes = [
          {type: 'ad', eventType: 'breakstart', eventData: {data: {title: 'ad title'}} },
          {type: 'ad', eventType: 'request', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'start', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'requestcomplete', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'response', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'loaded', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'durationchange', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'impression', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'started', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playstatechange', eventData: {}},
          {type: 'ad', eventType: 'playing', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playing', eventData: {}},
          {type: 'ad', eventType: 'play', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'companion', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'pause', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playstatechange', eventData: {}},
          {type: 'ad', eventType: 'play', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'resume', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playstatechange', eventData: {}},
          {type: 'ad', eventType: 'playing', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playing', eventData: {}},
          {type: 'ad', eventType: 'firstquartile', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'midpoint', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'pause', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playstatechange', eventData: {}},
          {type: 'ad', eventType: 'play', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'resume', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playstatechange', eventData: {}},
          {type: 'ad', eventType: 'playing', eventData: {data: {title: 'ad title'}}},
          {type: 'content', eventType: 'playing', eventData: {}},
          {type: 'ad', eventType: 'thirdquartile', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'ended', eventData: {data: {title: 'ad title'}}},
          {type: 'ad', eventType: 'breakend', eventData: {data: {title: 'ad title'}}}
        ]

        eventTypes.forEach((e) => {
          let event = new window.CustomEvent(e.eventType, {'detail': e.eventData})

          if (e.type === "ad") player.ads.dispatchEvent(event)
          else player.dispatchEvent(event)
        })
      }

      instance.readyHandler()
      triggerAd();

    })

    test.only('should trigger a pause for the add, and not for content', () => {
      expect(pageActionMock).toBeCalledWith('AD_PAUSED')
      expect(pageActionMock).not.toBeCalledWith('PLAYBACK_PAUSED')
    })
  })

});



