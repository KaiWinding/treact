const TEXT_ELEMENT = 'TEXT_ELEMENT'

export interface TreactElement {
  type: string
  props: {
    [name: string]: any
    children?: TreactElement[]
  }
}

console.log('hello treact !')

export function render(element: TreactElement, parentDom: any): void {
  const { type, props } = element

  if (type === TEXT_ELEMENT) {
    const dom = document.createTextNode(props.nodeValue)
    
    parentDom.appendChild(dom)

    return
  }

  const dom = document.createElement(type)

  const isListner = (name: string) => name.startsWith('on')
  Object.keys(props).filter(name => isListner(name))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, props[name])
    })

  const attributes = Object.keys(props).filter(key => key !== 'children')
  //@ts-ignore
  attributes.forEach(name => dom[name] = props[name])

  const childrenEl = props.children || []
  childrenEl.forEach(el => render(el, dom))

  console.log('dom = ', dom)

  parentDom.appendChild(dom)
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
