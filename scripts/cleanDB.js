const mongoose = require('mongoose')

const clear = async () =>
  new Promise(resolve => {
    mongoose.connect(
      process.env.DB_URL || 'mongodb://localhost/test',
      {
        useNewUrlParser: true
      },
      () => {
        mongoose.connection.db.dropDatabase()
        mongoose.connection.close()
        resolve()
      }
    )
  })

clear()
