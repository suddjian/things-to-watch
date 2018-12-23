import assert from 'assert'
import { createState } from '../public/stateful.mjs'

const startTime = Date.now()

const { getState, actions, subscribe } = createState({
  increment: (params, state) => ({ value: (state.value || 0) + 1 }),
  nested: {
    setThingy: (thingy) => ({ thingy }),
    setBongo: (bongo) => ({ bongo: bongo + ' bong'}),
  }
})
const initialState = getState()

assert.deepStrictEqual(initialState, getState())

actions.increment()
const incremented = getState()
assert.notStrictEqual(initialState, incremented)
assert.strictEqual(incremented.value, 1)

let unsub = subscribe((state) => {
  assert.strictEqual(state.value, 2)
})
actions.increment()
unsub()
actions.increment()

actions.nested.setThingy('test')
assert.strictEqual(getState().nested.thingy, 'test')

unsub = subscribe('nested', (state) => {
  assert.strictEqual(state.nested.bongo, 'bingo bong')
  console.log('boom')
})
actions.nested.setBongo('bingo')
actions.nested.setThingy('test3')
unsub()

unsub = subscribe('nested.bingo', (state) => {
  assert.strictEqual(state.nested.thingy, 'test5')
  assert.strictEqual(state.nested.bongo, 'bango bong')
  console.log('bam')
})
actions.increment()
actions.nested.setThingy('test4')
actions.nested.setThingy('test5')
actions.nested.setBongo('bango')



console.log(`\nlookin good (${Date.now() - startTime} ms)`)
