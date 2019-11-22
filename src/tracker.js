import * as nrvideo from 'newrelic-video-core'
import AmpAdsTracker from './adstracker'
import { version } from '../package.json'

export default class AmpTracker extends nrvideo.VideoTracker {
  setPlayer (player) {
    this.player = player
    this.tag = player.getMediaElement()
    this.registerListeners()
  }

  getTrackerName () {
    return 'akamai-media-player'
  }

  getTrackerVersion () {
    return version
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

    this.player.addEventListener('ready', this.onReady.bind(this))
    this.player.addEventListener('playrequest', this.onPlayrequest.bind(this))
    this.player.addEventListener('pause', this.onPause.bind(this))
    this.player.addEventListener('playing', this.onPlaying.bind(this))
    this.player.addEventListener('seeking', this.onSeeking.bind(this))
    this.player.addEventListener('seeked', this.onSeeked.bind(this))
    this.player.addEventListener('error', this.onError.bind(this))
    this.player.addEventListener('waiting', this.onWaiting.bind(this))
    this.player.addEventListener('mediasequenceended', this.onEnded.bind(this))
  }

  unregisterListeners () {
    this.player.removeEventListener('ready', this.onReady)
    this.player.removeEventListener('playrequest', this.onPlayrequest)
    this.player.removeEventListener('pause', this.onPause)
    this.player.removeEventListener('playing', this.onPlaying)
    this.player.removeEventListener('seeking', this.onSeeking)
    this.player.removeEventListener('seeked', this.onSeeked)
    this.player.removeEventListener('error', this.onError)
    this.player.removeEventListener('waiting', this.onWaiting)
    this.player.removeEventListener('mediasequenceended', this.onEnded)
  }

  onReady () {
    this.sendPlayerReady()
    this.setAdsTracker(new AmpAdsTracker(this.player, { tag: null }))
  }

  onPlayrequest () {
    this.sendRequest()
  }

  onPlaying () {
    if (!this.adsTracker || !this.adsTracker.state.isRequested) {
      this.sendStart()
      this.sendResume()
      this.sendBufferEnd()
    } else {
      this.adsTracker.sendBufferEnd()
    }
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

  onError (e) {
    nrvideo.Log.debug('Content Error Event e =', e)

    this.sendError()
  }

  onEnded () {
    this.sendEnd()
  }

  onWaiting () {
    if (
      this.tag.networkState === this.tag.NETWORK_LOADING &&
      this.tag.readyState < this.tag.HAVE_FUTURE_DATA
    ) {
      if (this.adsTracker && this.adsTracker.state.isStarted) {
        this.adsTracker.sendBufferStart()
      } else {
        this.sendBufferStart()
      }
    }
  }
}

AmpTracker.AmpAdsTracker = AmpAdsTracker
