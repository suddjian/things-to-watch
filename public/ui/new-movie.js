import { html as h } from '/lit-html/lit-html.js'
import { mapStreams } from '/utils.js'
import { user$ } from '/state/auth.js'
import { moviesRef } from '/firestore.js'

const createMovie$ = mapStreams([user$], user =>
  event => {
    event.preventDefault()
    console.log({event})
    console.log({user})
    const formData = getFormData(event.target)
    const movie = {
      title: formData.title,
      description: formData.description,
      submitter: user.uid,
    }
    console.log({moviesRef})
    moviesRef.add(movie)
  }
)

function FormInput({ name, placeholder }) {
  return h`
  <div class="form-item">
    <input name=${name} placeholder=${placeholder} />
  <div>
  `
}

const NewMoviePage = (create) => h`
  <form class="formative" @submit=${create}>
    ${FormInput({ name: 'title', placeholder: 'Title' })}
    ${FormInput({ name: 'description', placeholder: 'Description' })}
    <div class="form-item">
      <button type="submit">Create</button>
    </div>
  <form>
`

export const newMoviePage$ = mapStreams([createMovie$], NewMoviePage)

function getFormData(elForm) {
  const fields = elForm.querySelectorAll('input, select, textarea')
  const result = {}
  for (let i=0; i < fields.length; i++) {
    const field = fields[i]
    const key = field.name || field.id
    if (field.type === 'button' || field.type === 'image' || field.type === 'submit' || !key) continue
    switch (field.type) {
      case 'checkbox':
        result[key] = result[key] || []
        if (field.checked) result[key].push(field.value)
        break
      case 'radio':
        if (field.checked) result[key] = field.value
        break
      case 'select-multiple':
        result[key] = field.options
          .filter(option => option.selected)
          .map(option => option.value)
        break
      default:
        result[key] = field.value
    }
  }
  return result
}
