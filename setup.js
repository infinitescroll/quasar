// const IPFS = require('ipfs')
const { compileAndMigrate, startGanache } = require('./scripts')

module.exports = async () => {
  await startGanache()
  await compileAndMigrate()
  // const ipfs = await IPFS.create({
  //   config: {
  //     Addresses: {
  //       API: '/ip4/127.0.0.1/tcp/5002'
  //     }
  //   }
  // })

  // const config = await ipfs.config.get()
  // console.log('CONFIG', config)
}
