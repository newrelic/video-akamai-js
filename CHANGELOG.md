# Changelog
All notable changes to this project will be documented in this file.


## [0.4.1] - 2018/03/31
### Fix
- Controlled some ads functions that may or may not be defined in freewheel.

## [0.4.0] - 2018/03/02
## Add
- Add support for amp v2.86+

## [0.3.0] - 2017/11/02
### Change
- Buffer events reported during ads will be now reported as `AD_BUFFER_START/END`.
- Error events reported during ads will be now reported as `AD_ERROR`.

### Library
- Use lib `0.8+`.

## [0.2.0] - 2017/11/02
### Add
- Add support for `AD_CLICK`.

### Change
- Add a check for `akamai` lib before registering plugin and fires a warning if it is not present.

## [0.1.1] - 2017/10/24
### Library
- Upgrade to use `newrelic-rvideo-core` 0.5+

## [0.1.0]
- First Version