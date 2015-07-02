import React from 'react'
import ElementQuery from '../index.jsx'
import a11y from 'react-a11y'

// expose React for debugging
window.React = React
a11y(React)

window.ElementQuery = ElementQuery

const app = document.getElementById('app')
const el1 = (<ElementQuery sizes={[{name: 'large', width: 500}, {name: 'small', width: 300}]}>
    <h1 className="header">300px and 500px breakpoints</h1>
  </ElementQuery>)
const el2 = (<ElementQuery sizes={[{name: 'large', width: 300}, {name: 'small', width: 100}]} default="large">
      <h1>300px and 100px breakpoints</h1>
    </ElementQuery>)

const removeEl = () => {
  React.render((<div>
    cleared. check the console to see that there are no more elements being listened to
  </div>), app, () => {
    console.info('elements being listened to:', ElementQuery.componentMap.size)
  })
}

React.render((<div>
  <p>elements are blue when they're small and red when they're large</p>
  {el1}
  <div style={{width: '40%', border: '1px solid black'}}>
    <p>I'm in a div that's 40% of the window width</p>
    {el2}
  </div>
  <button onClick={removeEl}>Unmount</button>
</div>), app)

