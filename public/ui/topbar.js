const { combineLatest, timer,  operators: { map } } = rxjs
import { html as h } from '/lit-html/lit-html.js'
import { googleSignIn, signOut, user$, loading$ } from '/actions/auth.js'

const WumboButton = ({ action, text, loading, tick }) => h`
<button class="authbtn wumbo ${loading || ''}" @click=${action}>
  ${loading
    ? '.'.repeat(tick != null ? tick % 3 + 1 : 3)
    : text}
</button>
`

// apply some of the props to a function now, and some later
// (only works on functions that take a single object as a parameter)
const applySome = props => fn => moreProps => fn(Object.assign({}, props, moreProps))

const SignInBtn = applySome({ action: googleSignIn, text: 'Sign In'})(WumboButton)

const SignOutBtn = h`
<button class="link" @click=${signOut}>
  Sign Out
</button>
`

const Topbar = (user, loading, tick) => h`
  <header>
    <ul class="nav">
      ${user && h`
        <li class="item">
          <a href="/new">+ New</a>
        </li>
      `}
      <li class="item standoffish">
        ${user
          ? SignOutBtn
          : SignInBtn({ loading, tick })}
      </li>
    </ol>
  </header>
`

const ticker$ = timer(0, 1000)
export const topbar$ = combineLatest(user$, loading$, ticker$)
  .pipe(
    map(([user, loading, tick]) => Topbar(user, loading, tick))
  )
