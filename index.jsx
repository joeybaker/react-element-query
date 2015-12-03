import React, {PropTypes, Component, Children, cloneElement} from 'react'
import {findDOMNode} from 'react-dom'
import identity from 'lodash/utility/identity'
import sortBy from 'lodash/collection/sortBy'
import first from 'lodash/array/first'
import isNumber from 'lodash/lang/isNumber'
import raf from 'raf'
import pureRender from 'pure-render-decorator'

const isBrowser = typeof window !== 'undefined'

@pureRender
export default class ElementQuery extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
    , default: PropTypes.string
    , sizes: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired
      , width: (props, propName, componentName) => {
          const size = props[propName]
          if (!isNumber(size)) {
            return new Error(`${componentName} received a width of \`${size}\` for \`${props.name}\`. A number was expected.`)
          }

          if (size === 0) {
            return new Error(`${componentName} received a width of \`${size}\` for \`${props.name}\`. Widths are min-widths, and should be treated as "mobile-first". The default state can be set with the \`default\` prop, or even better with the "default" styles in CSS.`)
          }
        }
    })).isRequired
    , makeClassName: PropTypes.func
  }

  static defaultProps = {
    // if no default is defined, assume no className. This is the default browser
    // behavior
    default: ''
    , sizes: []
    , makeClassName: identity
    , children: <span />
  }

  constructor (props) {
    super(props)
    this.state = {size: props.default, sizes: ElementQuery.sortSizes(this.props.sizes)}
  }

  componentWillMount () {
    ElementQuery.register(this, this.state.sizes)
  }

  componentDidMount () {
    ElementQuery.sizeComponent(this, this.state.sizes)
  }

  componentWillReceiveProps (newProps) {
    this.setState({sizes: ElementQuery.sortSizes(newProps.sizes)})
  }

  componentWillUnmount () {
    ElementQuery.unregister(this)
  }

static _isListening = false

static _componentMap = new Map()

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
    if (!isBrowser) return

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
    if (!isBrowser) return

    ElementQuery._componentMap.delete(component)
    if (!ElementQuery._componentMap.size && isBrowser) ElementQuery.unListen()
  }

  static sizeComponents () {
    ElementQuery._componentMap.forEach((componentOptions, component) => {
      componentOptions.onResize(component, componentOptions.sizes)
    })
  }

  static sizeComponent (component, sizes) {
    const el = findDOMNode(component)
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
    const classNames = []
    const existingClassName = child.props.className
    if (existingClassName) classNames.push(existingClassName)
    if (className) classNames.push(className)

    return cloneElement(child, {className: classNames.join(' ')})
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
    const {children} = this.props
    const child = Array.isArray(children) && Children.count(children) === 1
      ? children[0]
      : children

    // because we're going to just apply the className onto the child, we can
    // only accept one. React doesn't let us return an array of children.
    // returning a wrapper div is undesirable because it creates un-expected DOM
    // like real element queries, this enables the user to do things like wrap
    // an `<li>` in an element query and not break HTML semantics, or use
    // element query and not break expectations around things like flexbox.
    return makeChild(Children.only(child), className)
  }
}
