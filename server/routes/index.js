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

router.delete('/contracts', async (req, res) => {
  if (!req.body.contractAddress) {
    return res.status(400).send('No contratAddress in request body.')
  }

  const dbResult = await SmartContractToPoll.deleteOne({
    address: req.body.contractAddress
  })

  if (dbResult.deletedCount === 1) {
    return res.status(202).send()
  } else if (dbResult.ok && dbResult.deletedCount === 0) {
    return res.status(204).send()
  } else {
    return res.status(500).send()
  }
})
