const router = require('express').Router()
const ipfs = require('../ipfs')
var sizeof = require('object-sizeof')
const multer = require('multer')
const { Pin, SmartContractToPoll } = require('../db')
const upload = multer()
module.exports = router

router.post('/dag/put', async (req, res) => {
  try {
    const result = await ipfs.node.dag.put(req.body)
    await ipfs.node.pin.add(result.toBaseEncodedString())
    await Pin.create({
      size: sizeof(req.body),
      cid: result.toBaseEncodedString(),
      time: new Date()
    })
    res.status(201).send(result.toBaseEncodedString())
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/files/add', upload.single('entry'), async (req, res) => {
  try {
    const result = await ipfs.node.add(req.file.buffer)
    await Pin.create({
      size: req.file.size,
      cid: result[0].hash,
      time: new Date()
    })
    res.status(200).send(result[0].hash)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/contracts', async (req, res) => {
  try {
    const count = await SmartContractToPoll.count({
      address: req.body.contractAddress
    })

    if (count > 0) return res.status(200).send()

    await SmartContractToPoll.create({
      address: req.body.contractAddress,
      lastPolledBlock: 0,
      sizeOfPinnedData: 0
    })
    res.status(201).send()
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/ipfs-provider', (_, res) => {
  return res.status(200).send({
    alias: process.env.ALIAS || 'aragon_association',
    host: process.env.IPFS_NODE_HOST || 'localhost',
    port: process.env.IPFS_NODE_PORT || '5002',
    protocol: process.env.IPFS_NODE_PROTOCOL || 'http'
  })
})

router.get('/contracts', async (_, res) => {
  try {
    const contracts = await SmartContractToPoll.find()
    res.status(200).send(contracts)
  } catch (error) {
    res.status(400).send(error)
  }
})
