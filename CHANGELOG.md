# Changelog

## v3.0.1 | 2016-09-02
* Fix correct onResize method signature #oops

## v3.0.0 | 2016-09-02
BREAKING CHANGES:

* now require react 15 as a peer depencency
* child must be a valid DOM node not a react component

## v2.0.2 | 2016-05-01
* Fix: after first browser render, check sizes again. This should ensure the
first render actually sets sizes.
* Internal: run tests against LTS and Stable only
* Internal: Travis CI: fix browser tests
* Internal: switch to separate updated lodash packages
* Internal: bump eslint and pure-render-decorator deps
* Internal: fix typo in the ElementQuery import

## v2.0.1 | 2015-12-03
* fix: Children merge classNames, not replace
* internal: update nsp

## v2.0.0 | 2015-11-11
* change: update for react 0.14
* change: deps updated, including major updates
* internal: upgrade react test tree (breaking)
* internal: linter #cleanup
* internal: update tests for new testTree syntax
* internal: Only test on node 4
* docs: note react 0.14 compatiblity
* doc: cleanup TOC
* doc: typos

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








