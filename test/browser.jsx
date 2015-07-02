import test from 'tape'
import ElementQuery from '../index.jsx'
import React from 'react'
import testTree from 'react-test-tree'

test('browser render', (t) => {
  const large = {name: 'large', width: 300}
  const small = {name: 'small', width: 150}
  const sizes = [large, small]

  // resize the window to be large so we're sure that's not affecting the elements
  window.resizeTo(1000, 50)

  const smallTree = testTree(<div style={{width: 200}} refCollection="container"><ElementQuery sizes={sizes}><h1>hi</h1></ElementQuery></div>, {mount: true})
  const smallEl = smallTree.container[0].element

  t.equal(
    smallEl.state.sizes[0].width
    , small.width
    , 'sorts the sizes by small width first'
  )

  t.equal(
    smallEl.state.size
    , small.name
    , 'matches the min width for the smallest size, not going to a larger size'
  )

  const largeTree = testTree(<div style={{width: 400}} refCollection="container"><ElementQuery sizes={sizes}><h1 ref="title">hi</h1></ElementQuery></div>, {mount: true})
  const largeEl = largeTree.container[0].element

  t.equal(
    largeEl.state.size
    , large.name
    , 'matches the min width, for the largest size'
  )

  t.end()
})
