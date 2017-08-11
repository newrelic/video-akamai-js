import * as nrvideo from 'newrelic-video-core'
import {version} from '../package.json'

export default class AmpAdsTracker extends nrvideo.Tracker {
  getTrackerName () {
    return 'akamai-media-player-ads'
  }

  getTrackerVersion () {
    return version
  }

  registerListeners () {
    if (this.player.ads) {
      nrvideo.Log.debugCommonVideoEvents(this.player.ads, [
        'breakstart',
        'breakend',
        'containercreated',
        'firstquartile',
        'midpoint',
        'thirdquartile',
        'impression',
        'started',
        'skipped',
        'request',
        'loaded'
      ], (e) => {
        nrvideo.Log.debug('Ad Event: ' + e.type)
      })

      this.player.ads.addEventListener('breakstart', this.onBreakStart.bind(this))
      this.player.ads.addEventListener('breakend', this.onBreakEnd.bind(this))
      this.player.ads.addEventListener('firstquartile', this.onFirstQuartile.bind(this))
      this.player.ads.addEventListener('midpoint', this.onMidPoint.bind(this))
      this.player.ads.addEventListener('thirdquartile', this.onThirdQuartile.bind(this))
      this.player.ads.addEventListener('click', this.onClick.bind(this))
      this.player.ads.addEventListener('play', this.onPlay.bind(this))
      this.player.ads.addEventListener('skipped', this.onSkipped.bind(this))
      this.player.ads.addEventListener('ended', this.onEnded.bind(this))
      this.player.ads.addEventListener('request', this.onRequest.bind(this))
      this.player.ads.addEventListener('loaded', this.onLoaded.bind(this))
      this.player.ads.addEventListener('pause', this.onPause.bind(this))
      this.player.ads.addEventListener('playing', this.onPlaying.bind(this))
    }
  }

  unregisterListeners () {
    if (this.player.ads) {
      this.player.ads.removeEventListener('breakstart', this.onBreakStart)
      this.player.ads.removeEventListener('breakend', this.onBreakEnd)
      this.player.ads.removeEventListener('firstquartile', this.onFirstQuartile)
      this.player.ads.removeEventListener('midpoint', this.onMidPoint)
      this.player.ads.removeEventListener('thirdquartile', this.onThirdQuartile)
      this.player.ads.removeEventListener('click', this.onClick)
      this.player.ads.removeEventListener('play', this.onPlay)
      this.player.ads.removeEventListener('skipped', this.onSkipped)
      this.player.ads.removeEventListener('ended', this.onEnded)
      this.player.ads.removeEventListener('request', this.onRequest)
      this.player.ads.removeEventListener('loaded', this.onLoaded)
      this.player.ads.removeEventListener('pause', this.onPause)
      this.player.ads.removeEventListener('playing', this.onPlaying)
    }
  }

  onBreakStart () {
    this.sendAdBreakStart()
  }

  onBreakEnd () {
    this.sendAdBreakEnd()
  }

  onFirstQuartile () {
    this.sendAdQuartile({quartile: 1})
  }

  onMidPoint () {
    this.sendAdQuartile({quartile: 2})
  }

  onThirdQuartile () {
    this.sendAdQuartile({quartile: 3})
  }

  onPlay () {
    this.sendStart()
  }

  onSkipped () {
    this.sendEnd({skipped: true})
  }

  onEnded () {
    this.sendEnd()
  }

  onRequest () {
    this.sendRequest()
  }

  onLoaded () {
    this.sendRequest()
  }

  onClick () {}

  onPause () {
    this.sendPause()
  }

  onPlaying () {
    this.sendResume()
  }
}
