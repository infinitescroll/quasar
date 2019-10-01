const mongoose = require('mongoose')

mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
  useNewUrlParser: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('connected!')
})
