/**
 * A redux-like state management and subscription module.
 *
 * Instead of dispatching events,
 * your actions will simply return a partial state,
 * which gets merged with the rest of the state.
 */

export function createState(actions) {
  let state = getDefaultState(actions);
  const listeners = createListenerNamespace()

  function createListenerNamespace(parent) {
    return {
      parent,
      listeners: [],
      children: {},
    }
  }

  function findListenerNamespace(path) {
    let namespace = listeners
    for (let i = 0; i < path.length; i++) {
      const name = path[i]
      if (!namespace.children[name]) return namespace
      namespace = namespace.children[name]
    }

    return path.reduce((namespace, name) => {
      return namespace.children[name] || namespace
    }, listeners)
  }

  function findOrCreateListenerNamespace(path) {
    return path.reduce((namespace, name) => {
      return namespace.children[name] = namespace.children[name] || createListenerNamespace(namespace)
    }, listeners)
  }

  function getState() {
    return state
  }

  function subscribe(path, listener) {
    if (typeof path === 'function') {
      listener = path
      path = []
    } else if (!listener) {
      throw TypeError('listener is required to subscribe to state changes')
    } else if (typeof path === 'string') {
      path = path.split('.').filter(x => x)
    }
    const namespace = findOrCreateListenerNamespace(path)
    namespace.listeners.push(listener)
    console.log(listeners.children.nested && listeners.children.nested.children)
    return function unsubscribe() {
      const index = namespace.listeners.indexOf(listener)
      if (index != -1) namespace.listeners.splice(index, 1)
    }
  }

  function getDefaultState(actionMap) {
    return Object.keys(actionMap)
    .reduce((acc, key) => {
      if (typeof actionMap[key] === 'object') {
        acc[key] = getDefaultState(actionMap[key])
      }
      return acc
    }, {})
  }

  function emitStateUpdate(state, namespace) {
    // alert the listeners, most specific first
    console.log(namespace)
    namespace.listeners.forEach(listener => listener(state))
    if (namespace.parent) {
      emitStateUpdate(state, namespace.parent)
    }
  }

  function bindActions(actionMap, path=[]) {
    return Object.keys(actionMap).reduce((acc, name) => {
      const expandedPath = [...path, name]
      if (typeof actionMap[name] === 'function') {
        // we found an action, let's bind it
        acc[name] = (params) => {
          const result = actionMap[name](params, state)
          if (!result || result instanceof Promise) return;
          // result is a partial key-value object
          state = Object.assign({}, state)
          // find where in the state our result needs to go
          const resultHome = path.reduce((partialState, namespace) => {
            return partialState[namespace] = Object.assign({}, partialState[namespace])
          }, state)
          Object.assign(resultHome, result)
          emitStateUpdate(state, findListenerNamespace(expandedPath))
        }
      } else {
        // recurse down the object tree
        acc[name] = bindActions(actionMap[name], expandedPath)
      }
      return acc
    }, {})
  }

  return { actions: bindActions(actions), subscribe, getState }
}
