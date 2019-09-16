const ipfs = require('./ipfs')

const dag = { test: 'dag' }

const sleep = () => new Promise(resolve => setTimeout(resolve, 2000))

beforeAll(() => {
  ipfs.init()
  return sleep()
})

test('Get and pin a dag', async done => {
  console.log('ipfs', ipfs)
  const node = ipfs.init()
  node.dag.put(dag).then(async res => {
    const hashObj = await ipfs.getAndPin(res.toBaseEncodedString('base32'))

    expect(hashObj[0].hash).toBe(res.toBaseEncodedString('base32'))
    done()
  })
})
