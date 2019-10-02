const supertest = require('supertest')
const { app } = require('../../server')
// const fs = require('fs')
// const formData = new FormData()
const request = supertest(app)

test('POST dag', done => {
  request
    .post('/api/v0/dag/put')
    .send({ test: '123' })
    .expect(201, done)
})

// test('POST file', async done => {
// fs.exists('./server/routes/screen.png', res => {
//   console.log('res', res)
// })
// formData.append('entry', fs.createReadStream('./network.txt'))
// const response = await fetch('http://localhost:3001/api/v0/add', {
//   method: 'POST',
//   body: formData
// })
// request
//   .post('/api/v0/add')
//   .field('thing', 'thing')
//   .attach('file', Buffer.from('a'.repeat(10000000)), 'filename')
//   .expect(201, done)
// })
