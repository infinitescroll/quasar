// const mongoose = require('mongoose')
// // const request = require('supertest')
// const Web3 = require('web3')
// const {
//   // registerPinWatcher,
//   handleListenEvent,
//   handleStopListeningEvent,
//   handlePinHashEvent
// } = require('./')

// const { node } = require('../ipfs')
// const {
//   demoSmartContractJson1,
//   demoSmartContractJson2
// } = require('../../mockData')
// const accounts = require('../../accounts.json')
// const listenerJSON = require('../../build/contracts/Listener.json')
// const { SmartContractToPoll, Pin } = require('../db')
// // const { app } = require('../index')

// let web3
// let contract
// let listenerContract

// // const listenerUnsubscribe = contractAddress =>
// //   new Promise((resolve, reject) => {
// //     listenerContract.methods
// //       .unsubscribeContract(contractAddress)
// //       .send({ from: accounts[0] }, err => {
// //         if (err) reject(err)
// //         setTimeout(() => {
// //           resolve()
// //         }, 1000)
// //       })
// //   })

// const emitListenToContractEvent = contractAddress =>
//   new Promise(resolve => {
//     listenerContract.methods
//       .listenToContract(contractAddress)
//       .send({ from: accounts[0] }, () => {
//         setTimeout(() => {
//           resolve()
//         }, 500)
//       })
//   })

// const removeHashIfPinned = async cid => {
//   const pins = await node.pin.ls()
//   const match = pins.find(item => item.hash === cid)
//   if (match) return node.pin.rm(match.hash)
//   return
// }

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

  // test('registerPinWatcher polls database and updates last polled block on each contract', async done => {
  //   const firstContractToPoll = await SmartContractToPoll.create({
  //     address: demoSmartContractJson1.address,
  //     lastPolledBlock: 0,
  //     sizeOfPinnedData: 0
  //   })

  //   const secondContractToPoll = await SmartContractToPoll.create({
  //     address: demoSmartContractJson2.address,
  //     lastPolledBlock: 0,
  //     sizeOfPinnedData: 0
  //   })

  //   const testKey = web3.utils.fromAscii('testKey')
  //   const dag = { testKey: 'testVal' }
  //   const hash = await node.dag.put(dag)
  //   storageContract.methods
  //     .registerData(testKey, hash.toBaseEncodedString())
  //     .send({ from: accounts[0] }, () => {
  //       registerPinWatcher()

  //       setTimeout(async () => {
  //         const updatedFirstContractInDB = await SmartContractToPoll.findById(
  //           firstContractToPoll._id
  //         )
  //         const updatedSecondContractInDB = await SmartContractToPoll.findById(
  //           secondContractToPoll._id
  //         )
  //         expect(updatedFirstContractInDB.lastPolledBlock).toBeGreaterThan(0)
  //         expect(updatedSecondContractInDB.lastPolledBlock).toBeGreaterThan(0)
  //         done()
  //       }, 100)
  //     })
  // })

  // test('registerListenWatcher polls database and updates last polled block on each contract', async done => {
  //   await ListenerContractToPoll.create({
  //     address: demoListenerContractJson.address,
  //     lastPolledBlock: 0
  //   })
  //   listenerContract.methods
  //     .listenToContract(demoSmartContractJson1.address)
  //     .send({ from: accounts[0] }, () => {
  //       listenerContract.methods
  //         .unsubscribeContract(demoSmartContractJson1.address)
  //         .send({ from: accounts[0] }, () => {
  //           registerListenWatcher()
  //           done()
  //         })
  //     })
  // })

  test('a file that outlives its TTL is eventually unpinned and removed from the DB and', () => {
    /* test will go here */
    expect(true).toBe(true)
  })
})
