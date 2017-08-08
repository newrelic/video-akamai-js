import * as nrvideo from 'newrelic-video-core'
import AmpAdsTracker from './adstracker'

export default class AmpTracker extends nrvideo.Tracker {
  setPlayer (player) {
    this.player = player
    this.tag = player.getMediaElement()
    this.registerListeners()
  }

  getTrackerName () {
    return 'akamai-media-player'
  }

  getPlayhead () {
    return this.player.getCurrentTime()
  }

  getDuration () {
    return this.player.getDuration()
  }

  getSrc () {
    return this.player.getSrc()
  }

  getTitle () {
    return this.player.getMedia().title
  }

  getPlayerVersion () {
    return this.player.getVersion()
  }

  isMuted () {
    return this.player.getMuted()
  }

  getRenditionBitrate () {
    let level = this.player.getQuality()
    if (level >= 0) {
      let qty = this.player.getQualityLevels()[level]
      return qty.bitrate
    }
  }

  getRenditionHeight () {
    let level = this.player.getQuality()
    if (level >= 0) {
      let qty = this.player.getQualityLevels()[level]
      return qty.height
    }
  }

  getRenditionWidth () {
    let level = this.player.getQuality()
    if (level >= 0) {
      let qty = this.player.getQualityLevels()[level]
      return qty.width
    }
  }

  getPlayrate () {
    return this.player.getPlaybackRate()
  }

  isAutoplayed () {
    return this.player.getAutoplay()
  }

  registerListeners () {
    nrvideo.Log.debugCommonVideoEvents(this.player, [
      'displaystatechange',
      'activestatechange',
      'playstatechange',
      'durationchange',
      'initialized',
      'mediasequencestarted',
      'mediasequenceended',
      'playrequest',
      'started',
      'ready',
      'timedmetadata'
    ])

    this.player.addEventListener('playstatechange', (e) => { nrvideo.Log.debug(e) })
    this.player.addEventListener('ready', this.onReady.bind(this))
    this.player.addEventListener('playrequest', this.onPlayrequest.bind(this))
    this.player.addEventListener('started', this.onStarted.bind(this))
    this.player.addEventListener('pause', this.onPause.bind(this))
    this.player.addEventListener('playing', this.onPlaying.bind(this))
    this.player.addEventListener('seeking', this.onSeeking.bind(this))
    this.player.addEventListener('seeked', this.onSeeked.bind(this))
    this.player.addEventListener('error', this.onError.bind(this))
    this.player.addEventListener('mediasequenceended', this.onEnded.bind(this))
  }

  unregisterListeners () {
    this.player.removeEventListener('ready', this.onReady)
    this.player.removeEventListener('playrequest', this.onPlayrequest)
    this.player.removeEventListener('started', this.onStarted)
    this.player.removeEventListener('pause', this.onPause)
    this.player.removeEventListener('playing', this.onPlaying)
    this.player.removeEventListener('seeking', this.onSeeking)
    this.player.removeEventListener('seeked', this.onSeeked)
    this.player.removeEventListener('error', this.onError)
    this.player.removeEventListener('mediasequenceended', this.onEnded)
  }

  onAdded () {
    if (this.player.ads) {
      this.sendPlayerInit()
    }
  }

  onReady () {
    this.sendPlayerReady()
    this.adsTracker = new AmpAdsTracker(this.player)
  }

  onPlayrequest () {
    this.sendRequest()
  }

  onStarted () {
    this.sendStart()
  }

  onPlaying () {
    this.sendResume()
  }

  onPause () {
    this.sendPause()
  }

  onSeeking () {
    this.sendSeekStart()
  }

  onSeeked () {
    this.sendSeekEnd()
  }

  onError () {
    this.sendError()
  }

  onEnded () {
    this.sendEnd()
  }
}

AmpTracker.AmpAdsTracker = AmpAdsTracker
