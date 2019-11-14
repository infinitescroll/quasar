const router = require('express').Router()
const ipfs = require('../ipfs')
var sizeof = require('object-sizeof')
const multer = require('multer')
const { Pin, StorageContract } = require('../db')
const { MAX_FILE_SIZE } = require('../constants')
const {
  BASE_IPFS_GATEWAY_URL,
  DAG_GET_IPFS_ENDPOINT,
  DAG_PUT_IPFS_ENDPOINT
} = require('../constants')
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
  if (req.file.size > MAX_FILE_SIZE)
    return res.status(413).send("File is bigger than 1GB. That's too big.")

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

router.post('/storageContracts', async (req, res) => {
  try {
    const count = await StorageContract.count({
      address: req.body.contractAddress
    })

    if (count > 0) return res.status(200).send()

    await StorageContract.create({
      address: req.body.contractAddress,
      lastPolledBlock: 0,
      sizeOfPinnedData: 0
    })
    res.status(201).send()
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/storageContracts', async (_, res) => {
  try {
    const contracts = await StorageContract.find()
    res.status(200).send(contracts)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/ipfs-provider', (_, res) => {
  return res.status(200).send({
    baseUrl: BASE_IPFS_GATEWAY_URL,
    dagGetUrl: DAG_GET_IPFS_ENDPOINT,
    dagPutUrl: DAG_PUT_IPFS_ENDPOINT
  })
})
