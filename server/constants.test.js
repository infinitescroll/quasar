const { baseUrlConstructor } = require('./constants')

test('base url correctly constructed', () => {
  expect(baseUrlConstructor('http', 'localhost.org', '5002', '/ipfs')).toBe(
    'http://localhost.org:5002/ipfs'
  )
})
