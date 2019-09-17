const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const ipfsWrapper = require('./state/ipfs')
// const ethereum = require('./utils/ethereum')
const PORT = process.env.PORT || 3001
const app = express()
const node = ipfsWrapper({
  host: process.env.IPFS_NODE_HOST ? process.env.IPFS_NODE_HOST : 'localhost',
  port: process.env.IPFS_NODE_PORT ? process.env.IPFS_NODE_PORT : '5001',
  protocol: process.env.IPFS_NODE_PROTOCOL
    ? process.env.IPFS_NODE_PROTOCOL
    : 'http',
  headers: null
})

module.exports = {
  app,
  node
}

if (!process.env['NODE_ENV']) {
  require('dotenv').config({ path: __dirname + '/.env' })
}

const createApp = async () => {
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

const startListening = () => {
  app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))
}

createApp()
startListening()
// ethereum.testWatching()
