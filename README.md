# newrelic-video-core [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
#### [New Relic](http://newrelic.com) video tracking core library

## Requirements
This video monitor solutions works on top of New Relic's **Browser Agent**.

## Usage
You can use this script in two ways:

### Standard way
Add **scripts** inside `dist` folder to your page.

> To generate `dist` folder, run `npm install && npm run build`.

```js
nrvideo.Core.addTracker(new AmpTracker(player))
```

### Akamai Media Player Plugin Ecosystem
You can use built-in AMP plugin system.

```js
config.plugins = {
  newrelic: {
    resources: [
      { 
        src:'../dist/newrelic-video-akamai.min.js', 
        type: 'text/javascript' 
      }
    ]
  }
  /* More config... */
}
```