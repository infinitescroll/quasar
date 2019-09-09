const router = require('express').Router()
const {addSmartContract, getSmartContracts} = require('../../state')
module.exports = router

router.post('/', (req, res, next) => {
    console.log('posting ', req.body)
    if (req.body.smartContract && req.body.network && req.body.abi){
        addGoodData(req.body)
        res.status(200).send('OK')
    } else {
        let missingFields = `missing fields: ${(!req.body.smartContract) ? 'smartContract, ' : ''}${(!req.body.network) ? 'network, ' : ''}${(!req.body.abi) ? 'abi' : ''}`
        res.status(400).send({'error': missingFields})
    }
})

const addGoodData = body => {
    console.log('adding smart contract: ', body)
    addSmartContract(body)
    console.log('smart contracts: ', getSmartContracts())
}
