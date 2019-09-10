const router = require('express').Router()
const { addSmartContract, getSmartContracts } = require('../../state')
module.exports = router

router.post('/', (req, res, next) => {
	const invalidFields = addSmartContract(req.body)
	if (invalidFields) res.status(400).send({ error: invalidFields })
	else res.status(200).send('OK')
})
