const router = require('express').Router()
const smartContracts = require('../../state')
module.exports = router

router.post('/', async (req, res) => {
  try {
    await smartContracts.add(req.body)
    res.status(200).send('OK')
  } catch (err) {
    res.status(400).send(err.message)
  }
})
