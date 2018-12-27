const { timer } = rxjs
import { googleSignIn, user$, loading$ } from '/state/auth.js'
import { html as h } from '/lit-html/lit-html.js'
import { mapStreams, applySome } from '/utils.js'
import { topbar$ } from './topbar.js'
import { newMoviePage$ } from './new-movie.js'
import { WumboButton } from './buttons.js'

const MainPage = (topbar, newMoviePage) => h`
<div class="wrapp">
  ${topbar}
  <div class="content">
    ${newMoviePage}
  </div>
</div>
`

const SignInBtn = applySome({ action: googleSignIn, text: 'Sign In'})(WumboButton)

const SignInPage = (loading, tick) => h`
<div class="full">
  ${SignInBtn({ loading, tick })}
</div>
`

const Page = (user, topbar, newMoviePage, loading, tick) => {
  if (user) {
    return MainPage(topbar, newMoviePage)
  }
  return SignInPage(loading, tick)
}

export const page$ = mapStreams([user$, topbar$, newMoviePage$, loading$, timer(0, 1000)], Page)
