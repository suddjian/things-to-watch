const compose = (...fns) => x =>
  fns.reduce((value, fn) => fn(value), x)
const not = x => !x
const exists = x => x != null
const isEmpty = x => {
  if (x == null) return true
  if (x.length === 0) return true
  if (x.length) return false
  if (Object.keys(x).length === 0) return true
  return false
}
const notEmpty = compose(isEmpty, not)

// A beam stores a piece of state, and emits updates when that state changes.
// It's a little bit like a stream,
// a little bit like a cache,
// and a little bit like an event emitter.
function createBeam(initialState) {
  const listeners = []
  let state = initialState
  let isUpdating = false

  const methods = {
    get: () => state,

    update(newState) {
      if (isUpdating) {
        throw new Error('It is poor form to change state during a state update')
      }
      if (newState === state) return;
      oldState = state
      state = newState // so that calls to `get` will return the correct value
      isUpdating = true
      try {
        listeners.forEach(listener => {
          listener(newState, oldState)
        })
      } finally {
        isUpdating = false
      }
    },

    watch(fn) {
      listeners.push(fn)
    },

    unwatch(fn) {
      const i = listeners.indexOf(fn)
      if (i >= 0) {
        listeners.splice(i, 1)
      }
    },
  }

  return methods
}

function makeMeta(beam, detectLoad = exists) {
  const loading = createBeam(false)
  beam.isLoading = loading.get
  beam.startLoading = () => loading.update(true)
  beam.stopLoading = () => loading.update(false)

  const error = createBeam(null)
  beam.getError = error.get
  beam.setError = error.update

  error.watch(err => {
    if (err) beam.stopLoading()
  })

  beam.meta = combine({ loading, error })

  beam.watch(updated => {
    if (detectLoad(updated)) {
      beam.error(null)
      beam.stopLoading()
    }
  })

  return beam
}

function metaBeam (initialState, detectLoad) {
  const beam = createBeam(initialState)
  makeMeta(beam, detectLoad)
  return beam
}

// takes a map of name -> beam, and returns a new beam,
// whose state is a map of name -> state
export function combine(beamMap) {
  const names = Object.keys(beamMap)

  const combined = createBeam(
    names.reduce((acc, name) => {
      acc[name] = beamMap[name].get()
      return acc
    }, {})
  )

  const realUpdate = combined.update
  delete combined.update

  names.forEach(name => {
    beamMap[name].watch((value) => {
      realUpdate(Object.assign({}, combined.get(), {
        [name]: value
      }))
    })
  })

  return combined
}

export function debouncer (beam, ms=0) {
  const debounced = createBeam()
  const realUpdate = debounced.update
  let latestState = beam.get()
  let timeoutId = null

  debounced.update = (newState) => {
    latestState = newState
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
      timeoutId = null
      realUpdate(latestState)
    }, ms)
  }
  return debounced
}

export const collector = (initialState, append) => (wrappedBeam) => {
  const collection = createBeam(initialState)

  wrappedBeam.watch(value => {
    collection.update(append(collection.get(), value))
  })

  return collection
}

export const arrayCollector = collector([], (collection, value) => [...collection, value])

export const mapCollector = (getKey) => {
  if (typeof getKey === 'string') {
    getKey = (key => value => value[key])(getKey)
  }
  return collector({}, (collection, value) =>
    Object.assign({}, collection, { [getKey(value)]: value })
  )
}

export const auth = metaBeam(null)
export const user = metaBeam(null)
export const users = metaBeam([], notEmpty)
