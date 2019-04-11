const { BehaviorSubject } = rxjs
import { moviesRef } from '/firestore'

export const movies$ = new BehaviorSubject(null)

moviesRef.onSnapshot(movies => movies$.next(movies))
