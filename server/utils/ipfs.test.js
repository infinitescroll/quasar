const ipfs = require('./ipfs')

const dag = { test: 'dag' }

test('Get and pin a dag', () => {
  setTimeout(() => {
    return ipfs.node.dag.put(dag).then(async res => {
      const hashObj = await ipfs.getAndPin(res.toBaseEncodedString('base32'))
      expect(hashObj[0].hash).toBe(res.toBaseEncodedString('base32'))
    })
  }, 2000)
})
