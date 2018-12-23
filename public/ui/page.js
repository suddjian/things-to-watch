const { combineLatest, timer,  operators: { map } } = rxjs
import { html as h } from '/lit-html/lit-html.js'
import { user$, loading$ } from '/actions/auth.js'

const SignInPrompt = (loading, tick) => h`
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

const Page = (user, loading, tick) => h`
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
