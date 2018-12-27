const { BehaviorSubject, operators: { first, mapTo, skip } } = rxjs
import firestore, { usersRef } from '/firestore.js'

// skip the initial null value while uninitialized
export const auth$ = new BehaviorSubject(null).pipe(skip(1))
export const user$ = new BehaviorSubject(null).pipe(skip(1))
export const loading$ = new BehaviorSubject(false)

const get = (...paths) => (obj) => {
  let result = obj
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    if (result != null) {
      result = result[path]
    } else {
      return result
    }
  }
}

user$.subscribe(async user => {
  if (user) {
    const userData = {
      defaultProfile: {
        name: user.displayName,
        photoURL: user.photoURL,
      }
    }
    await usersRef.doc(user.uid).set(userData, { merge: true })
  }
})

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

// old, modified sample code from google:

// import * as state from './hey-listen.js'

// const signInButton = document.getElementById('quickstart-sign-in')
// const usernav = document.getElementById('usernav')

// function signIn() {
//   const provider = new firebase.auth.GoogleAuthProvider()
//   provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
//   return firebase.auth().signInWithPopup(provider)
//   .then((result) => {
//     console.debug('sign in result', result)
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     const token = result.credential.accessToken
//     // The signed-in user info.
//     const user = result.user
//   })
//   .catch((error) => {
//     const errorCode = error.code
//     const errorMessage = error.message
//     // The email of the user's account used.
//     const email = error.email
//     // The firebase.auth.AuthCredential type that was used.
//     const credential = error.credential
//     signInButton.disabled = false
//     if (errorCode === 'auth/account-exists-with-different-credential') {
//       alert('You have already signed up with a different auth provider for that email.')
//       // TODO: handle linking the user's accounts here.
//     } else {
//       console.error(error)
//     }
//   })
// }

// /**
//  * Function called when clicking the Login/Logout button.
//  */
// function toggleSignIn() {
//   state.loadingUser.update(true)
//   if (!firebase.auth().currentUser) {
//     signIn()
//   } else {
//     firebase.auth().signOut()
//   }
//   signInButton.disabled = true
// }

// firebase.auth().onAuthStateChanged((user) => {
//   console.debug('firebase auth state changed')
//   state.loadingUser.update(false)
//   state.user.update(user)
//   if (user) {
//     // User is signed in.
//     console.debug('user state received', user)
//     signInButton.textContent = 'Sign Out'
//     usernav.disabled = false
//   } else {
//     // User is signed out.
//     signInButton.textContent = 'Sign In'
//   }
//   usernav.disabled = true
//   signInButton.disabled = false
// })

// signInButton.addEventListener('click', toggleSignIn, false)
