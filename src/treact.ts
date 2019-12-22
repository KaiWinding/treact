const TEXT_ELEMENT = 'TEXT_ELEMENT'

export interface ITreactElement {
  type: string | typeof Component
  props: {
    [name: string]: any
    children: ITreactElement[]
  }
}

class TreactElement implements ITreactElement {
  type: string
  props: {
    [name: string]: any
    children: ITreactElement[]
  }

  constructor(type: string, props: ITreactElement['props']) {
    this.type = type
    this.props = props
  }
}

export class Component {
  _internalInstance: TreactInstance
  props: any
  state: any

  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }

  setState(particalState) {
    this.state = Object.assign({}, this.state, particalState)
    updateInternalInstance(this._internalInstance)
  }

  public render() {
    return null
  }
}

function updateInternalInstance(internalInstance: TreactInstance) {
  const parentDom = internalInstance.dom.parentNode
  const element = internalInstance.element

  reconcile(parentDom, internalInstance, element)
}

function createPublicInstance(element: ITreactElement, internalInstance) {
  const { type, props } = element
  const publicInstance = new (type as typeof Component)(props)
  publicInstance._internalInstance = internalInstance

  return publicInstance
}

interface TreactInstance {
  dom: any
  element: ITreactElement,
  childInstances?: TreactInstance[]
  childInstance?: TreactInstance
  publicInstance?: any
}

let rootInstance: TreactInstance | null  = null

export function render(element: ITreactElement, parentDom: any): void {
  const prevInstance = rootInstance
  const nextInstance = reconcile(parentDom, prevInstance, element)

  rootInstance = nextInstance
}

function reconcile(
  parentDom,
  prevInstance: TreactInstance | null,
  element: ITreactElement): TreactInstance {
  if (!prevInstance) {
    const newInstance = instantiate(element)

    parentDom.appendChild(newInstance.dom)

    return newInstance
  } else if (!element) {
    parentDom.removeChild(prevInstance.dom)

    return null
  } else if (prevInstance.element.type !== element.type) {
    const newInstance = instantiate(element)

    parentDom.replaceChild(newInstance.dom, prevInstance.dom)

    return newInstance
  } else if (typeof element.type === 'string') {
    updateDomProperties(prevInstance.dom, prevInstance.element.props, element.props)
    prevInstance.childInstances = reconcileChildren(prevInstance, element)
    prevInstance.element = element

    return prevInstance
  } else {
    prevInstance.publicInstance.props = element.props
    const childElement = prevInstance.publicInstance.render()
    const oldChildInstance = prevInstance.childInstance
    const childInstance = reconcile(parentDom, oldChildInstance, childElement)
    prevInstance.dom = childInstance.dom
    prevInstance.childInstance = childInstance
    prevInstance.element = element

    return prevInstance
  }
}

function reconcileChildren(instance: TreactInstance, element: ITreactElement): TreactInstance['childInstances'] {
  const {
    dom,
    childInstances: prevChildInstance
  } = instance
  const nextChildElements = element.props.children
  const nextChildInstances = []
  const count = Math.max(prevChildInstance.length, nextChildElements.length)

  for (let i = 0; i < count; i++) {
    nextChildInstances.push(reconcile(dom, prevChildInstance[i], nextChildElements[i]))
  }

  return nextChildInstances.filter(el => el !== null)
}

function instantiate(element: ITreactElement): TreactInstance {
  const { props, type } = element
  const isDomElement = typeof type === 'string'

  if (isDomElement) {
    const isTextElement = type => type === TEXT_ELEMENT
    const dom = isTextElement(type)
      ? document.createTextNode('')
      : document.createElement((type as string))
  
    updateDomProperties(dom, [], props)
  
    const childInstances = props.children
      ? props.children.map(instantiate)
      : []
  
    childInstances.forEach((instance: TreactInstance) => {
      dom.appendChild(instance.dom)
    })
  
    const instance = {
      dom,
      element,
      childInstances
    }
  
    return instance
  } else {
    const instance = {}
    const publicInstance = createPublicInstance(element, instance)
    const childElement = publicInstance.render()
    const childInstance = instantiate(childElement)
    const dom = childInstance.dom

    Object.assign(instance, {
      dom,
      element,
      childInstance,
      publicInstance
    })

    return (instance as TreactInstance)
  }
}

function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = (prop: string) => prop.startsWith('on')
  const isAttribute = (prop: string) => !isEvent(prop) && prop !== 'children'
  const getEventTypeFromProp = (prop: string) => prop.toLowerCase().substring(2)

  const unChangedProps = []
  const updatedProps = []
  const addedProps = []
  const removedProps = []

  Object.keys(nextProps).forEach((prop: string) => {
    if ((prop in prevProps) || (prevProps[prop] !== nextProps)) updatedProps.push(prop)
    if (!(prop in prevProps)) addedProps.push(prop)
    if (prevProps[prop] ===  nextProps[prop]) unChangedProps.push(prop)
  })
  Object.keys(prevProps).forEach((prop: string) => {
    if (!(prop in nextProps)) removedProps.push(prop)
  })

  removedProps.forEach((prop: string) => {
    if (isEvent(prop)) {
      const eventType = getEventTypeFromProp(prop)

      dom.removeEventListener(eventType, prevProps[prop])
    } else if (isAttribute(prop)) {
      dom[prop] = null
    }
  })

  addedProps.forEach((prop: string) => {
    if (isEvent(prop)) {
      const eventType = getEventTypeFromProp(prop)

      dom.addEventListener(eventType, nextProps[prop])
    } else if (isAttribute(prop)) {
      dom[prop] = nextProps[prop]
    }
  })

  updatedProps.forEach((prop: string) => {
    if (isEvent(prop)) {
      const eventType = getEventTypeFromProp(prop)

      dom.removeEventListener(eventType, prevProps[prop])
      dom.addEventListener(eventType, nextProps[prop])
    } else if (isAttribute(prop)) {
      dom[prop] = nextProps[prop]
    }
  })
}

export function createElement(type, config, ...args) {
  const props = Object.assign({}, config)
  const hasChildren = args.length > 0

  props.children = hasChildren
    ? args.map(el => el instanceof TreactElement ? el : createTextElement(el))
    : []

  return new TreactElement(type, props)
}

function createTextElement(value: string) {
  return createElement(TEXT_ELEMENT, { nodeValue: value })
}
