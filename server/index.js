const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const {
  registerStorageRegistryWatcher,
  registerPinWatcher
} = require('./ethereum')
const { registerPinChecker } = require('./db')
const {
  log,
  DB_POLL_INTERVAL,
  STORAGE_REGISTRY_CONTRACT_ADDRESS,
  TTL
} = require('./constants')
const PORT = process.env.PORT || 3003
const app = express()

const createApp = async () => {
  app.use(morgan('dev'))
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  if (process.env['NODE_ENV'] !== 'test') {
    app.use(
      rateLimit({
        windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
        max: process.env.RATE_LIMIT_MAX || 100
      })
    )
  }

  app.use('/api/v0', require('./routes'))

  app.use((req, _res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found')
      err.status = 404
      next(err)
    } else {
      next()
    }
  })

  app.use((err, _req, res, _next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })
}

const startListening = async () => {
  await createApp()
  app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))
}

const bootApp = () => {
  mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', async () => {
    log(
      'registering storage registry watcher at: ',
      STORAGE_REGISTRY_CONTRACT_ADDRESS
    )
    registerStorageRegistryWatcher(STORAGE_REGISTRY_CONTRACT_ADDRESS)
    log('registering pin watcher')
    registerPinWatcher()
    log(
      'registering pin checker with TTL: ',
      TTL,
      ' and DB_POLL_INTERVAL: ',
      DB_POLL_INTERVAL
    )
    registerPinChecker(TTL, DB_POLL_INTERVAL)
    log('starting api server')
    await startListening()
  })
}

// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp()
} else {
  createApp()
}

module.exports = {
  bootApp,
  startListening,
  app,
  registerStorageRegistryWatcher,
  registerPinWatcher
}
