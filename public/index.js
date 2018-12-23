// var morph = require('nanomorph')
import { render } from '/lit-html/lit-html.js'
import { googleSignIn, user$, auth$ } from '/actions/auth.js'
import { topbar$ } from '/ui/topbar.js'

const header = document.getElementById('header')

topbar$.subscribe(element => {
  render(element, header)
})

