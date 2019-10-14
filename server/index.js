const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const {
  registerListenWatcher,
  registerStopListeningWatcher,
  web3
} = require('./ethereum')
const listenerJSON = require('../build/contracts/Listener.json')
const { networkId } = require('./ethereum/provider')
const { Pin } = require('./db')
const PORT = process.env.PORT || 3001
const app = express()

if (!process.env['NODE_ENV']) {
  require('dotenv').config({ path: __dirname + '/.env' })
}

const listenerContract = new web3.eth.Contract(
  listenerJSON.abi,
  listenerJSON.networks[networkId].address
)

const createApp = async () => {
  registerListenWatcher(listenerContract)
  registerStopListeningWatcher(listenerContract)

  app.use(morgan('dev'))
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

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

const autoCleanDB = async () => {
  await Pin.findandRemoveOldPins()
  setInterval(async () => {
    await Pin.findandRemoveOldPins()
  }, 1209600000)
}

const bootApp = () => {
  mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', async () => {
    await createApp()
    await startListening()
  })

  autoCleanDB()
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

module.exports = { bootApp, startListening, app }
