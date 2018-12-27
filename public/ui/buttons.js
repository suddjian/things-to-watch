import { html as h } from '/lit-html/lit-html.js'

export const WumboButton = ({ action, text, loading, tick }) => h`
<button class="authbtn wumbo ${loading || ''}" @click=${action}>
  ${loading
    ? '.'.repeat(tick != null ? tick % 3 + 1 : 3)
    : text}
</button>
`
