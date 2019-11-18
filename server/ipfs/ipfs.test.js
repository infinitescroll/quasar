const { formatHeaders, removeEmptyFields } = require('./')

describe('formatHeaders', () => {
  test('it removes "headers" field from ipfs options if no Authorization param is passed', () => {
    const optionsWithoutAuth = {
      host: 'localhost',
      port: '5001',
      protocol: 'http',
      headers: null,
      'api-path': ''
    }
    expect(formatHeaders(optionsWithoutAuth).headers).toBeUndefined()

    const optionsWithAuth = {
      host: 'localhost',
      port: '5001',
      protocol: 'http',
      headers: { Authorization: 'Bearer <token>' },
      'api-path': ''
    }

    expect(formatHeaders(optionsWithAuth).headers).toBeDefined()
  })
})

describe('removeEmptyFields', () => {
  test('it removes false fields from objects', () => {
    const optionsWithEmpties = {
      host: 'localhost',
      port: '5001',
      protocol: 'http',
      headers: null,
      'api-path': ''
    }

    expect(removeEmptyFields(optionsWithEmpties).headers).toBeUndefined()
    expect(removeEmptyFields(optionsWithEmpties)['api-path']).toBeUndefined()

    expect(removeEmptyFields(optionsWithEmpties).host).toBeDefined()
    expect(removeEmptyFields(optionsWithEmpties).port).toBeDefined()
    expect(removeEmptyFields(optionsWithEmpties).protocol).toBeDefined()
  })
})
