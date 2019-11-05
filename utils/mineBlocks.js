const mine = async web3 =>
  new Promise((resolve, reject) =>
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_mine'
      },
      (error, _) => {
        if (error) return reject('mineBlock error: ', error)
        resolve()
      }
    )
  )

module.exports = web3 => async blocks => {
  for (var i = 0; i < blocks; i++) {
    try {
      await mine(web3)
    } catch (e) {
      console.log('error', e)
    }
  }
}
