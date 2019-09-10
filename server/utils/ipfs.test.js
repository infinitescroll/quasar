const ipfs = require('./ipfs')

const dag = { test: 'dag' }

const put = ipfs.node.dag
  .put(dag)
  .then(res => {})
  .catch(error => {})

test('Get and pin a dag', async () => {
  const hashObj = await ipfs.node.dag
    .put(dag)
    .then(async res => {
      const hashObj = await ipfs.getAndPin(res.toBaseEncodedString('base32'))
      expect(hashObj[0].hash).toBe(res.toBaseEncodedString('base32'))
    })
    .catch(error => {
      console.error(error)
    })
})
