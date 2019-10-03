const request = require('supertest')
const FormData = require('form-data')
const fs = require('fs')
const axios = require('axios')
const { app } = require('../index')
// const fs = require('fs')
// const formData = new FormData()

// test('POST dag', done => {
//   request
//     .post('/api/v0/dag/put')
//     .send({
//       dag: { test: '123' },
//       smartContract: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
//     })
//     .expect(201, done)
// })

test('POST file', async done => {
  // const form = new FormData()
  // const file = fs.createReadStream('./readme.md')
  // console.log('FILE', file)
  // form.append('entry', file)
  // console.log('FORM', form.getHeaders())
  // const superApp = await request(app)

  // await axios.post('http://localhost:3001/api/v0/files/add', form, {
  //   headers: form.getHeaders()
  // })
  // superApp.end()
  done()

  // .post('/api/v0/files/add')
  // .field('filename', 'readme.md')
  // .attach('entry', form)
  // .set(form.getHeaders())
  // .expect(201, done)
})
