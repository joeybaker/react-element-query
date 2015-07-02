import React, {PropTypes, Component, Children} from 'react'
import {addons} from 'react/addons'
import identity from 'lodash/utility/identity'
import sortBy from 'lodash/collection/sortBy'
import first from 'lodash/array/first'
import raf from 'raf'
const {shouldComponentUpdate} = addons.PureRenderMixin
const {cloneWithProps} = addons

const isBrowser = typeof window !== 'undefined'

export default class ElementQuery extends Component {
  constructor (props) {
    super(props)
    this.state = {size: props.default, sizes: ElementQuery.sortSizes(this.props.sizes)}
  }

  componentWillMount () {
    ElementQuery.register(this, this.state.sizes)
  }

  componentDidMount () {
    if (isBrowser) ElementQuery.sizeComponent(this, this.state.sizes)
  }

  componentWillReceiveProps (newProps) {
    this.setState({sizes: ElementQuery.sortSizes(newProps.sizes)})
  }

  // use the pure-render mixin without the mixin. This allows us to use es6
  // classes and avoid "magic" code. NOTE: if this component is used directly
  // by react-router, you should delete it, otherwise, the <Link> component will
  // not cause a re-render
  shouldComponentUpdate (...args) {
    return shouldComponentUpdate.apply(this, args)
  }

  componentWillUnmount () {
    ElementQuery.unregister(this)
  }

  // use only one global listener … for perf!
  static listen () {
    window.addEventListener('resize', ElementQuery.onResize)
    ElementQuery._isListening = true
  }

  static unListen () {
    window.removeEventListener('resize', ElementQuery.onResize)
    ElementQuery._isListening = false
  }

  static register (component, sizes, onResize) {
    ElementQuery._componentMap.set(component, {
      sizes
      // if a custom onResize callback is passed, e.g. using this lib just for
      // the resize event listener, use that. Else, assume we're sizing the
      // component
      , onResize: onResize || ElementQuery.sizeComponent
    })
    if (!ElementQuery._isListening && isBrowser) ElementQuery.listen()
  }

  static unregister (component) {
    ElementQuery._componentMap.delete(component)
    if (!ElementQuery._componentMap.size && isBrowser) ElementQuery.unListen()
  }

  static sizeComponents () {
    ElementQuery._componentMap.forEach((componentOptions, component) => {
      componentOptions.onResize(component, componentOptions.sizes)
    })
  }

  static sizeComponent (component, sizes) {
    const el = React.findDOMNode(component)
    const width = el.clientWidth
    const smallestSize = first(sizes)

    let matchedSize = ''
    let matchedWidth = smallestSize.width

    sizes.some((test) => {
      // check for:
      // 1. the el width is greater or equal to the test width
      // 2. the el width is greater or equal to the min test width
      if (width >= test.width && width >= matchedWidth) {
        matchedSize = test.name
        matchedWidth = test.width
      }
      // once that condition isn't true, we've found the correct match; bail
      else {
        return true
      }
    })
    component.setSize(matchedSize)
  }

  // becuase we're going to itterate through by size, we need to ensure that the
  // sizes are sorted
  static sortSizes (sizes) {
    return sortBy(sizes, 'width')
  }

  setSize (size) {
    this.setState({size})
  }

  static makeChild (child, className) {
    // just add our new class name onto the chilren, this alleviates the need to
    // create a wrapper div
    return cloneWithProps(child, {className})
  }

  static onResize () {
    if (ElementQuery._frame) raf.cancel(ElementQuery._frame)
    ElementQuery._frame = raf(ElementQuery.sizeComponents)
  }

  render () {
    const size = isBrowser
      ? this.state.size
      : this.props.default
    const className = size ? this.props.makeClassName(size) : ''
    const makeChild = ElementQuery.makeChild

    // because we're going to just apply the className onto the child, we can
    // only accept one. React doesn't let us return an array of children.
    // returning a wrapper div is undesirable because it creates un-expected DOM
    // like real element queries, this enables the user to do things like wrap
    // an `<li>` in an element query and not break HTML semantics, or use
    // element query and not break expectations around things like flexbox.
    return makeChild(Children.only(this.props.children), className)
  }
}

ElementQuery.propTypes = {
  children: PropTypes.element.isRequired
  , 'default': PropTypes.string
  , sizes: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string
    , width: PropTypes.number
  })).isRequired
  , makeClassName: PropTypes.func
}

ElementQuery.defaultProps = {
  // if no default is defined, assume no className. This is the default browser
  // behavior
  'default': ''
  , sizes: []
  , makeClassName: identity
  , children: <span />
}

ElementQuery._isListening = false

ElementQuery._componentMap = new Map()
