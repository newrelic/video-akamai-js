import * as nrvideo from 'newrelic-video-core'
import {version} from '../package.json'

export default class AmpAdsTracker extends nrvideo.VideoTracker {
  /**
   * Add custom attributes for Akamai Ads
   * @param {object} [att] Collection of key value attributes
   * @return {object} Filled attributes
   * @final
   */
  getAttributes (att) {
    let baseAttr = super.getAttributes(att)
    if (this._adId != null) {
      baseAttr["adId"] = this._adId
    }
    return baseAttr
  }

  getTrackerName () {
    return 'akamai-media-player-ads'
  }

  getTrackerVersion () {
    return version
  }

  getPlayerVersion () {
    if (this.parentTracker) return this.parentTracker.getPlayerVersion()
  }

  getPlayhead () {
    return null
  }

  getTitle () {
    return this.title
  }

  getRenditionHeight () {
    return this.height
  }

  getRenditionWidth () {
    return this.width
  }

  getSrc () {
    return this.src
  }

  getAdPosition () {
    if (this.position === 'preroll') {
      return nrvideo.Constants.AdPositions.PRE
    } else if (this.position === 'midroll') {
      return nrvideo.Constants.AdPositions.MID
    } else if (this.position === 'postroll') {
      return nrvideo.Constants.AdPositions.POST
    }
  }

  getDuration () {
    return this.duration
  }

  setValues (e) {
    if (e && e.data) {
      if (e.data.metadata) {
        try { this.title = e.data.metadata.getTitle() } catch (err) {}
        try { this.src = e.data.metadata.getMediaUrl() } catch (err) {}
        try { this.height = e.data.metadata.getHeight() || e.data.metadata.getVastMediaWidth() } catch (err) {}
        try { this.width = e.data.metadata.getWidth() || e.data.metadata.getVastMediaHeight() } catch (err) {}
      }
      this.position = e.data.type
      this.duration = e.data.duration
      this.partner = e.data.partner
      this._adId = e.data.id
    }
  }

  registerListeners () {
    if (this.player.ads) {
      nrvideo.Log.debugCommonVideoEvents(this.player.ads, [
        'breakstart',
        'breakend',
        'adclicked',
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
      this.player.ads.addEventListener('adclicked', this.onClick.bind(this))
      this.player.ads.addEventListener('play', this.onPlay.bind(this))
      this.player.ads.addEventListener('skipped', this.onSkipped.bind(this))
      this.player.ads.addEventListener('ended', this.onEnded.bind(this))
      this.player.ads.addEventListener('request', this.onRequest.bind(this))
      this.player.ads.addEventListener('loaded', this.onLoaded.bind(this))
      this.player.ads.addEventListener('pause', this.onPause.bind(this))
      this.player.ads.addEventListener('playing', this.onPlaying.bind(this))
      this.player.ads.addEventListener('error', this.onError.bind(this))

      /**
       * Ad ID
       * @private
       */
      this._adId = null
    }
  }

  unregisterListeners () {
    if (this.player.ads) {
      this.player.ads.removeEventListener('breakstart', this.onBreakStart)
      this.player.ads.removeEventListener('breakend', this.onBreakEnd)
      this.player.ads.removeEventListener('firstquartile', this.onFirstQuartile)
      this.player.ads.removeEventListener('midpoint', this.onMidPoint)
      this.player.ads.removeEventListener('thirdquartile', this.onThirdQuartile)
      this.player.ads.removeEventListener('adclicked', this.onClick)
      this.player.ads.removeEventListener('play', this.onPlay)
      this.player.ads.removeEventListener('skipped', this.onSkipped)
      this.player.ads.removeEventListener('ended', this.onEnded)
      this.player.ads.removeEventListener('request', this.onRequest)
      this.player.ads.removeEventListener('loaded', this.onLoaded)
      this.player.ads.removeEventListener('pause', this.onPause)
      this.player.ads.removeEventListener('playing', this.onPlaying)
      this.player.ads.removeEventListener('error', this.onError)
    }
  }

  onBreakStart (e) {
    this.setValues(e)
    this.sendAdBreakStart()
  }

  onBreakEnd (e) {
    this.setValues(e)
    this.sendAdBreakEnd()
  }

  onFirstQuartile (e) {
    this.setValues(e)
    this.sendAdQuartile({ quartile: 1 })
  }

  onMidPoint (e) {
    this.setValues(e)
    this.sendAdQuartile({ quartile: 2 })
  }

  onThirdQuartile (e) {
    this.setValues(e)
    this.sendAdQuartile({ quartile: 3 })
  }

  onPlay (e) {
    this.setValues(e)
    this.sendStart({ adPartner: this.partner })
  }

  onSkipped (e) {
    this.setValues(e)
    this.sendEnd({ skipped: true })
  }

  onEnded (e) {
    this.setValues(e)
    this.sendEnd()
  }

  onRequest (e) {
    this.setValues(e)
    this.sendRequest()
  }

  onLoaded (e) {
    this.setValues(e)
    this.sendRequest()
  }

  onClick (e) {
    this.setValues(e)
    this.sendAdClick({ url: 'unknown' })
  }

  onPause (e) {
    this.setValues(e)
    this.sendPause()
  }

  onPlaying (e) {
    this.setValues(e)
    this.sendResume()
  }

  onError (e) {
    this.setValues(e)
    this.sendError({"errorMessage": e.data.error.getMessage(), "errorCode": e.data.error.getErrorCode()})
  }
}
