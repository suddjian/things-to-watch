import { render } from '/lit-html/lit-html.js'
import { page$ } from '/ui/page.js'

const root = document.body

page$.subscribe(element => {
  render(element, root)
})

