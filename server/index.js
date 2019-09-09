const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const PORT = process.env.PORT || 3001
const app = express()
module.exports = app

// if (process.env.NODE_ENV !== 'production') require('../secrets')

const createApp = () => {
  // logging middleware
  app.use(morgan('dev'))

  // cors middleware
  app.use(cors())

  // body parsing middleware
  app.use(express.json())

  app.use(express.urlencoded({ extended: true }))

  // compression middleware
  // app.use(compression())

  app.use('/api/v0', require('./routes'))

  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found')
      err.status = 404
      next(err)
    } else {
      next()
    }
  })

  // error handling endware
  app.use((err, req, res, next) => {
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
