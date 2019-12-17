```js
const quasarUrl = 'http://quasar.yourdomain.com' // Wherever you are hosting the server.

// Tell quasar to listen for pin events from a smart contract at contractAddress.
async function addStorageContract(contractAddress) {
  return await fetch(`${quasarUrl}/api/v0/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contractAddress })
  })
}

// Get a list of storage contracts that quasar is listening to for pin events.
async function getStorageContracts() {
  const response = await fetch(`${quasarUrl}/api/v0/contracts`, {
    method: 'GET'
  })
  return await response.json()
}

// Quasar optimistically pins your dag then returns a hash for you to pass to a storage contract.
// If the storage contract is registered with quasar, the pin is confirmed.
// If the pin is never confirmed, quasar removes it after days defined in TTL envirionment variable.
async function dagPut(dag) {
  const response = await fetch(`${quasarUrl}/api/v0/dag/put`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dag)
  })
  const hash = await response.text()
  storageContract.invokePinMethod(hash)
  return hash
}

// Same as above, but files instead of dags.
async function addFile(file) {
  const response = await fetch(`${quasarUrl}/api/v0/files/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    file
  })
  const hash = await response.text()
  storageContract.invokePinMethod(hash)
  return hash
}
```
