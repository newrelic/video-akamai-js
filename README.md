# newrelic-video-core [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
#### [New Relic](http://newrelic.com) video tracking core library

## Requirements
This video monitor solutions works on top of New Relic's **Browser Agent**.

## Usage
### Standard way
Add **scripts** inside ```dist``` folder to your page.

> If you want to know how to generate ```dist``` folder, refer to **npm commands** section.

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

## NPM Commands
Remember to run ```npm install``` the first time.

Run ```npm run build``` to build the solution. You can find the output inside ```dist``` folder.

Run ```npm run watch``` to watch the files inside ```src``` and run a build everytime a file is changed.

Use ```build:dev``` and ```watch:dev``` to generate human-readable dist files.

Use ```npm run clean``` to clear any generated files.


## Code Standards
This project follows [Standard Javascript](https://standardjs.com/) specifications.

The changelog format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

### Eslint
Use eslint to help you maintain code standards:
```bash
npm install eslint eslint-config-standard eslint-plugin-import eslint-plugin-mocha eslint-plugin-node eslint-plugin-promise eslint-plugin-standard --global
````
