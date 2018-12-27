const firestore = firebase.firestore()
firestore.settings({
  timestampsInSnapshots: true
})

export default firestore

export const moviesRef = firestore.collection('movies')
export const usersRef = firestore.collection('users')
