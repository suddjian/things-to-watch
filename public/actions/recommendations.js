const { BehaviorSubject, operators: { first, mapTo, skip } } = rxjs

// skip the initial null value while uninitialized
export const auth$ = new BehaviorSubject(null).pipe(skip(1))
export const user$ = new BehaviorSubject(null).pipe(skip(1))
export const loading$ = new BehaviorSubject(false)

firebase.auth().onAuthStateChanged((user) => {
  console.debug('firebase auth state changed', user)
  user$.next(user)
})

const signInFn = (provider) => () => {
  loading$.next(true)
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
  return firebase.auth().signInWithPopup(provider)
  .then((result) => {
    console.debug('sign in result', result)
    auth$.next(result)
    loading$.next(false)
    // This gives you a Google Access Token. You can use it to access the Google API.
    const token = result.credential.accessToken
    // The signed-in user info.
    const user = result.user
  })
  .catch((error) => {
    auth$.error(error)
    loading$.next(false)
    const errorCode = error.code
    if (errorCode === 'auth/account-exists-with-different-credential') {
      alert('That email has already been signed up with a different auth provider. We should be linking your accounts here, but I have a lazy.')
      // TODO: handle linking the user's accounts here.
    } else {
      console.error(error)
    }
  })
}

export const googleSignIn = signInFn(new firebase.auth.GoogleAuthProvider())
export const signOut = () => {
  loading$.next(true)
  firebase.auth().signOut()
  .then(() => {
    loading$.next(false)
  })
}
