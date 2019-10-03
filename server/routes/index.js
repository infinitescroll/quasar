const router = require('express').Router()
const ipfs = require('../ipfs')
const { Pin } = require('../db')
const multer = require('multer')
const upload = multer()
var sizeof = require('object-sizeof')
module.exports = router

router.post('/dag/put', async (req, res, _next) => {
  if (!req.body.dag) {
    res.status(400).send('Missing dag')
    return
  } else if (!req.body.smartContract) {
    res.status(400).send('Missing smart contract address')
    return
  }

  try {
    const result = await ipfs.node.dag.put(req.body.dag)
    const size = sizeof(req.body.dag)
    const pin = new Pin({
      size: size,
      cid: result.toBaseEncodedString(),
      smartContract: req.body.smartContract,
      time: new Date()
    })

    pin.save(error => {
      if (error) {
        res.status(400).send(error)
      } else {
        res.status(201).send(result.toBaseEncodedString())
      }
    })
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

router.post('/add', upload.single('entry'), async (req, res, _next) => {
  if (!req.file || !req.file.buffer) {
    res.status(400).send('Missing file')
    return
  } else if (!req.body.smartContract) {
    res.status(400).send('Missing smart contract address')
    return
  }

  try {
    const result = await ipfs.node.add(req.file.buffer)
    const pin = new Pin({
      size: req.file.size,
      cid: result[0].hash,
      smartContract: req.body.smartContract,
      time: new Date()
    })

    pin.save(error => {
      if (error) {
        res.status(400).send(error)
      } else {
        res.status(200).send(result[0].hash)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})
