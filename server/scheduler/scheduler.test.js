const Scheduler = require('./')

describe('job scheduler', () => {
  test('calls callback once at the beginning and once at every interval', done => {
    const callback = jest.fn()
    const taskRunner = new Scheduler(callback, 100)
    setTimeout(() => {
      expect(callback.mock.calls.length).toBe(3)
      taskRunner.stop()
      done()
    }, 299)
  })

  test('does not callback after stop command is issued', done => {
    const callback = jest.fn()
    const taskRunner = new Scheduler(callback, 100)
    setTimeout(() => {
      taskRunner.stop()
      setTimeout(() => {
        expect(callback.mock.calls.length).toBe(1)
        done()
      }, 299)
    }, 99)
  })
})
