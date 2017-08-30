/* global describe, it, beforeEach */

const assert = require('assert')
const sinon = require('sinon')
const noop = require('../../../lib/utils/noop')

describe('BrainSelector', function () {
  const BrainSelector = require('../../../lib/brainSelector/index.js')
  let brainSelector = null

  /**
   * Will set the brainSelector variable to an instance of the BrainSelector class.
   */
  beforeEach(function () {
    brainSelector = new BrainSelector('default')
  })

  describe('constructor', function () {
    it('should set the defaultBrain on the constructor', function () {
      assert.equal('default', brainSelector.defaultBrain, 'Default brain not set to default')
    })
  })

  describe('use()', function () {
    it('should add the function to the list', function () {
      brainSelector.use('test', noop)
      assert.equal(noop, brainSelector.selectors[0])
    })
    it('should check that the selector is a function', function () {
      try {
        brainSelector.use('fails', {})
        assert.ok(false, 'Error expected')
      } catch (e) {
        assert.ok(true, 'Error thrown')
        assert.equal('Selector is not a function.', e.message)
      }
    })
  })

  describe('setBrains()', function () {
    it('should set the brains on a local property', function () {
      let brainSelector = new BrainSelector()
      const brainList = [{brain: {start: noop, process: noop}}]
      brainSelector.setBrains(brainList)
      assert.equal(brainList, brainSelector.brains)
    })
  })

  describe('getBrainForInput', function () {
    it('should select a matching promise', function () {
      let selectedBrain = {process: noop, start: noop}
      let selector = function () { return Promise.resolve(selectedBrain) }

      let defaultSelectorStub = sinon.mock().never()
      brainSelector.defaultSelector = defaultSelectorStub

      brainSelector.use('test', selector)

      return brainSelector.getBrainForInput({input: 'heard'})
       .then(function (brain) {
         assert.deepEqual(selectedBrain, brain)
       })
       .catch(function () {
         throw new Error('Catch is not expected.')
       })
    })

    it('should fallback to defaultSelector if there is no middleware', function () {
      let defaultSelectorStub = sinon.stub()
      brainSelector.defaultSelector = defaultSelectorStub

      brainSelector.getBrainForInput({input: 'heard'})
      assert.ok(defaultSelectorStub.calledOnce)
      assert.ok(defaultSelectorStub.calledWithExactly(sinon.match.any, {input: 'heard'}))
    })

    it('should fallback to defaultSelector if there are no matches', function () {
      let defaultSelectorStub = sinon.stub()
      brainSelector.defaultSelector = defaultSelectorStub
      brainSelector.selectors = [() => { return Promise.reject() }]

      brainSelector.getBrainForInput({input: 'heard'})
        .then(function () {
          assert.ok(defaultSelectorStub.calledOnce)
          assert.ok(defaultSelectorStub.calledWithExactly(sinon.match.any, {input: 'heard'}))
        })
        .catch(function () {
          assert.ok(false, 'Expected promise to resolve.')
        })
    })
  })
})