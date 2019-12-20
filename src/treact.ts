const TEXT_ELEMENT = 'TEXT_ELEMENT'

export interface TreactElement {
  type: string
  props: {
    [name: string]: any
    children?: TreactElement[]
  }
}

interface TreactInstance {
  dom: any
  element: TreactElement,
  childInstances: TreactInstance[]
}

console.log('hello treact !')

let rootInstance: TreactInstance | null  = null

export function render(element: TreactElement, parentDom: any): void {
  const prevInstance = rootInstance
  const nextInstance = reconcile(parentDom, prevInstance, element)

  rootInstance = nextInstance
}

function reconcile(
  parentDom,
  prevInstance: TreactInstance | null,
  element: TreactElement): TreactInstance {
  if (!prevInstance) {
    const newInstance = instantiate(element)

    parentDom.appendChild(newInstance.dom)

    return newInstance
  }
}

function instantiate(element: TreactElement): TreactInstance {
  const { props, type } = element

  const isTextElement = type => type === TEXT_ELEMENT
  const dom = isTextElement(type)
    ? document.createTextNode(props.nodeValue)
    : document.createElement(type)

  console.log('dom = ', dom)
  console.log('props = ', props)

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
}

function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = (prop: string) => prop.startsWith('on')
  const isAttribute = (prop: string) => !isEvent && prop !== 'children'
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

  if (hasChildren) props.children = args.map(el => el instanceof Object ? el : createTextElement(el))

  return { type, props }
}

function createTextElement(value: string) {
  return createElement(TEXT_ELEMENT, { nodeValue: value })
}
