/* eslint-disable react/no-multi-comp */

import test from 'tape'
import ElementQuery from '../src/index.jsx'
import React from 'react'
import {mount} from 'enzyme'
import sinon from 'sinon'

const WIDTH_LARGE = 300
const WIDTH_SMALL = 100
const SIZE_LARGE = 'large'
const SIZE_SMALL = 'small'
const large = {name: SIZE_LARGE, width: WIDTH_LARGE}
const small = {name: SIZE_SMALL, width: WIDTH_SMALL}
const sizes = [large, small]

// TODO: move move me to a module like `react-tape`, and maybe have it be a
// browserify transform?
// proptype failures will go to console.warn, fail the tests when one is seen
test('test setup', (t) => {
  console._error = console.error
  console.error = (...args) => {
    t.fail(args.join(' '))
  }
  // resize the window to be large so we're sure that's not affecting the elements
  window.resizeTo(WIDTH_LARGE * 2, 1)
  t.pass('ok')
  t.end()
})


test('small size', (t) => {
  const wrapper = document.createElement('div')
  wrapper.style.width = `${WIDTH_SMALL}px`
  document.body.appendChild(wrapper)
  const tree = mount(<ElementQuery sizes={sizes}>
      <h1>hi</h1>
    </ElementQuery>
    , {attachTo: wrapper}
  )

  t.equal(
    tree.state('sizes')[0].width
    , small.width
    , 'sorts the sizes by small width first'
  )

  t.equal(
    tree.state('size')
    , small.name
    , 'matches the min width for the smallest size, not going to a larger size'
  )

  t.end()
})

test('large size', (t) => {
  const wrapper = document.createElement('div')
  wrapper.style.width = `${WIDTH_LARGE + WIDTH_SMALL}px`
  document.body.appendChild(wrapper)
  const tree = mount(
    <ElementQuery sizes={sizes}><h1>hi</h1></ElementQuery>
    , {attachTo: wrapper}
  )
  t.equal(
    tree.state('size')
    , large.name
    , 'matches the min width, for the largest size'
  )

  t.end()
})

test('fails on invalid sizes', (t) => {
  const errorStub = sinon.stub()
  const _error = console.error
  console.error = errorStub

  const nonNumberSizes = [{name: 'hi', width: 'not a number'}]
  mount(<ElementQuery sizes={nonNumberSizes}><span>hi</span></ElementQuery>)

  t.ok(
    errorStub.calledOnce
    , 'errors when a non-number width is passed'
  )
  errorStub.reset()

  const zeroWidth = [{name: 'hi', width: 0}]
  mount(<ElementQuery sizes={zeroWidth}><span>hi</span></ElementQuery>)

  t.ok(
    errorStub.calledOnce
    , 'errors when a `0` width is passed'
  )
  errorStub.reset()

  console.error = _error
  t.end()
})
