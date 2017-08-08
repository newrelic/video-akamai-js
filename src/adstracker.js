import * as nrvideo from 'newrelic-video-core'

export default class AmpAdsTracker extends nrvideo.Tracker {
  registerListeners () {
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
  }
}
