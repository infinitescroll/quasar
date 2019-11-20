const Pin = require('./pinSchema')
const Scheduler = require('../scheduler')

module.exports = (ttl, interval = 1209600000) => {
  return new Scheduler(async () => {
    await Pin.findandRemoveOldPins(ttl)
  }, interval)
}
