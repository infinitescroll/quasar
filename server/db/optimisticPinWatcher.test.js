const registerOptimisticPinChecker = require('./optimisticPinChecker')
const Scheduler = require('../scheduler')

describe('registerOptimisticPinChecker', () => {
  test('registerOptimisticPinChecker returns an instance of the scheduler', async () => {
    const optimisticPinChecker = registerOptimisticPinChecker(0, 500)
    optimisticPinChecker.stop()
    expect(optimisticPinChecker instanceof Scheduler).toBe(true)
  })
})
