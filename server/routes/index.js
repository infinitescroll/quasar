const router = require('express').Router()
const ipfs = require('../ipfs')
var sizeof = require('object-sizeof')
const multer = require('multer')
const { Pin } = require('../db')
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
