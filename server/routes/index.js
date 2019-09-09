const router = require('express').Router()
module.exports = router

router.use('/contracts', require('./contracts'))
