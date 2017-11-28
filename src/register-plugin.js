/**
* Registers a plugin factory function. This function is
* called when akamai.amp.AMP.create is called and the
* config object contains the plugin's key.
*
* @param {String} key
* The plugin's key. Used to configure the plugin.
*
* @param {Function} factory
* The factory function used to create plugin.
*
* @param {String|Array.<String>} [mode=["html", "flash"]]
* Optional player mode(s) in which the plugin can be used.
*/
if (typeof akamai !== 'undefined') {
  akamai.amp.AMP.registerPlugin('newrelic', function createNewRelicTracker (player, config) {
    var tracker = new nrvideo.AmpTracker(player, config)
    nrvideo.Core.addTracker(tracker)
  })
} else {
  nrvideo.Log.warn('Could not find akamai library to register this Tracker.')
}
