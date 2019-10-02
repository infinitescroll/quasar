const supertest = require('supertest')
const { app } = require('../../server')
// const fs = require('fs')
// const formData = new FormData()
const request = supertest(app)

test('POST dag', done => {
  request
    .post('/api/v0/dag/put')
    .send({
      dag: { test: '123' },
      smartContract: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
    })
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
//   .attach('file', Buffer.from('aa'), 'filename')
//   .expect(201, done)
// })
