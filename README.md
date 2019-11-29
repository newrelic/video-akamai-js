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
## Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT. Issues and contributions should be reported to the project here on GitHub.

We encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.