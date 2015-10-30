import test from 'tape'
import ElementQuery from '../index.jsx'
import React from 'react'
import {renderToString} from 'react-dom/server'

test('server', (t) => {
  const large = {name: 'large', width: 300}
  const small = {name: 'small', width: 150}
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
