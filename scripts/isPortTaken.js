const net = require('net')

const isPortTaken = port =>
  new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once('error', function(err) {
        if (err.code != 'EADDRINUSE') reject(err)
        resolve(true)
      })
      .once('listening', function() {
        tester
          .once('close', function() {
            resolve(false)
          })
          .close()
      })
      .listen(port)
  })

module.exports = isPortTaken
