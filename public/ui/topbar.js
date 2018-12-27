const { timer } = rxjs
import { html as h } from '/lit-html/lit-html.js'

import { mapStreams } from '/utils.js'
import { signOut, user$, loading$ } from '/state/auth.js'

const SignOutBtn = h`
<button class="link" @click=${signOut}>
  Sign Out
</button>
`

const Topbar = (user) => h`
  <header>
    ${user && h`
      <div class="item">
        <a href="/new">+ New</a>
      </div>
    `}
    <div class="item standoffish">
      ${user && SignOutBtn}
    </div>
  </header>
`

export const topbar$ = mapStreams([user$], Topbar)
