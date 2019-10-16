describe('integration tests', () => {
  // test('firing listen event adds contract to db, unsubscribing removes', async done => {
  //   const registerContract = contract =>
  //     new Promise(resolve => {
  //       listenerContract.methods
  //         .listenToContract(contract.address)
  //         .send({ from: accounts[0] }, () => {
  //           setTimeout(() => {
  //             resolve()
  //           }, 1000)
  //         })
  //     })
  //   await Promise.all([
  //     await registerContract(demoSmartContractJson1),
  //     await registerContract(demoSmartContractJson2)
  //   ])
  //   const smartContractToPoll = await SmartContractToPoll.findOne({
  //     address: demoSmartContractJson1.address
  //   })
  //   expect(smartContractToPoll.address).toBe(demoSmartContractJson1.address)
  //   expect(smartContractToPoll.sizeOfPinnedData).toBe(0)
  //   expect(smartContractToPoll.lastPolledBlock).toBe(0)
  //   const secondSmartContractToPoll = await SmartContractToPoll.findOne({
  //     address: demoSmartContractJson2.address
  //   })
  //   expect(secondSmartContractToPoll.address).toBe(
  //     demoSmartContractJson2.address
  //   )
  //   expect(secondSmartContractToPoll.sizeOfPinnedData).toBe(0)
  //   expect(secondSmartContractToPoll.lastPolledBlock).toBe(0)
  //   listenerContract.methods
  //     .unsubscribeContract(demoSmartContractJson1.address)
  //     .send({ from: accounts[0] }, () => {
  //       setTimeout(async () => {
  //         const smartContractToPoll = await SmartContractToPoll.findOne({
  //           address: demoSmartContractJson1.address
  //         })
  //         const secondSmartContractToPoll = await SmartContractToPoll.findOne({
  //           address: demoSmartContractJson2.address
  //         })
  //         expect(smartContractToPoll).toBe(null)
  //         expect(secondSmartContractToPoll.address).toBe(
  //           demoSmartContractJson2.address
  //         )
  //         done()
  //       }, 1000)
  //     })
  // })
  // test(`emitting listen event from listener, then emittting pin event
  // from pinning contract (without registering pinner) keeps file pinned`, async done => {
  //   const testKey = web3.utils.fromAscii('testKey')
  //   const dag = { testKey: 'testVal' }
  //   const hash = await node.dag.put(dag)
  //   await removeHashIfPinned(hash.toBaseEncodedString())
  //   await emitListenToContractEvent(demoSmartContractJson1.address)
  //   contract.methods
  //     .registerData(testKey, hash.toBaseEncodedString())
  //     .send({ from: accounts[0] }, () => {
  //       setTimeout(async () => {
  //         const pins = await node.pin.ls()
  //         const match = pins.find(
  //           item => item.hash === hash.toBaseEncodedString()
  //         )
  //         expect(match).toBeDefined()
  //         done()
  //       }, 2200)
  //     })
  // }, 7500)
  test('a file that outlives its TTL is eventually unpinned and removed from the DB and', () => {
    /* test will go here */
    expect(true).toBe(true)
  })
})
