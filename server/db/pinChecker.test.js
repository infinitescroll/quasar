const registerPinChecker = require('./pinChecker')
const Scheduler = require('../scheduler')

describe('registerPinChecker', () => {
  test('registerPinChecker returns an instance of the scheduler', async () => {
    const optimisticPinChecker = registerPinChecker(0, 500)
    optimisticPinChecker.stop()
    expect(optimisticPinChecker instanceof Scheduler).toBe(true)
  })
})
