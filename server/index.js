const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Web3 = require('web3')
const {
  registerListenWatcher,
  registerStopListeningWatcher
} = require('./ethereum')
const listenerJSON = require('../build/contracts/Listener.json')
const PORT = process.env.PORT || 3001
const app = express()

if (!process.env['NODE_ENV']) {
  require('dotenv').config({ path: __dirname + '/.env' })
}

const web3 = new Web3(
  new Web3.providers.WebsocketProvider('ws://localhost:8545')
)
const listenerContract = new web3.eth.Contract(
  listenerJSON.abi,
  listenerJSON.networks['123'].address
)

const createApp = async () => {
  registerListenWatcher(listenerContract)
  registerStopListeningWatcher(listenerContract)

  app.use(morgan('dev'))
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

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
console.log('did we even make it hur')
if (require.main === module) {
  startListening()
} else {
  console.log('module not main lolz')
  createApp()
}

module.exports = { listenerContract, web3, startListening }
