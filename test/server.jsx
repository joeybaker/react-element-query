import test from 'tape'
import ElementQuery from '../index.jsx'
import React from 'react'
import {renderToString} from 'react-dom/server'

const WIDTH_LARGE = 300
const WIDTH_SMALL = 100
const SIZE_LARGE = 'large'
const SIZE_SMALL = 'small'

test('server', (t) => {
  const large = {name: SIZE_LARGE, width: WIDTH_LARGE}
  const small = {name: SIZE_SMALL, width: WIDTH_SMALL}
  const sizes = [large, small]

  const html = renderToString(<ElementQuery sizes={sizes}><h1>hi</h1></ElementQuery>)

  t.ok(
    html.includes('<h1')
    , 'renders ok'
  )

  const htmlWithDefault = renderToString((
    <ElementQuery sizes={sizes} default={small.name}><h1>hi</h1></ElementQuery>
  ))

  t.ok(
    htmlWithDefault.includes(`class="${small.name}"`)
    , 'renders the default class name'
  )

  t.end()
})
