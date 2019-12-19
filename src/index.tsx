/** @jsx createElement */

import { render, TreactElement, createElement } from './treact.js'

const root = document.getElementById('root')

const App: TreactElement = {
  type: 'div',
  props: {
    onClick: () => alert('click app'),
    className: 'wrap',
    children: [
      {
        type: 'TEXT_ELEMENT',
        props: {
          nodeValue: 'Hello Treact ! i am kun . how are you ???'
        }
      }
    ]
  }
}

const Wrap = <div onClick={()=>{alert('hello')}}>
  <span>
    hello jsx !
  </span>
</div>

render(Wrap, root)

console.log('hello treact ! 886')
