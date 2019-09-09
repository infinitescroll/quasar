const router = require('express').Router()
module.exports = router

router.post('/', (req, res, next) => {
  console.log('posting ', req.body)
  res.status(200).send('posting ', req.body)
})
