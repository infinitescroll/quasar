const router = require('express').Router()
const ipfs = require('../ipfs')
const multer = require('multer')
const upload = multer()
module.exports = router

router.post('/dag/put', async (req, res, _next) => {
  try {
    const result = await ipfs.node.dag.put(req.body)
    // Save mongo entry
    res.status(200).send(result.toBaseEncodedString())
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

router.post('/file/add', upload.single('entry'), async (req, res, _next) => {
  try {
    const result = await ipfs.node.add(req.file.buffer)
    // Save mongo entry
    res.status(200).send(result[0].hash)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})
