const { combineLatest,  operators: { map } } = rxjs

export function mapStreams(streams, component) {
  return combineLatest(...streams)
  .pipe(
    map(values => component(...values))
  )
}

// apply some of the props to a function now, and some later
// (only works on functions that take a single object as a parameter)
export const applySome = props => fn => moreProps => fn(Object.assign({}, props, moreProps))
