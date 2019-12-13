var FormData = require('form-data')
var fs = require('fs')
const axios = require('axios')

const sendFile = async () => {
  const form = new FormData()
  form.append('entry', fs.createReadStream('./readme.md'))
  const res = await axios.post('http://localhost:3003/api/v0/add', form, {
    headers: form.getHeaders()
  })
  console.log('res', res)
}

sendFile()
