# Changelog

## v1.1.1 | 2015-08-15
* fix: prevent server-side memory leak by never registering for events on the
server.

## v1.1.0 | 2015-07-23
* add: PropTypes warn on invalid widths. Non-numbers continue to be invalid,
but we're no also checking for widths of `0`. Setting to `0` will defeat
server-side rendering. Use the `default` prop or just "mobile-first" CSS.
* internal: tests now fail on React warnings

## v1.0.0 | 2015-07-09
Init



