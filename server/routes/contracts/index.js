const router = require('express').Router()
const { addSmartContract } = require('../../state')
module.exports = router

router.post('/', (req, res, _next) => {
  try {
    addSmartContract(req.body)
    res.status(200).send('OK')
  } catch (err) {
    res.status(400).send({ error: err })
  }
})
