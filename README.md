[![codecov](https://codecov.io/gh/openworklabs/quasar/branch/primary/graph/badge.svg)](https://codecov.io/gh/openworklabs/quasar)

[![Build Status](https://travis-ci.org/openworklabs/quasar.svg?branch=primary)](https://travis-ci.org/openworklabs/quasar)

NOTE: make sure `node -v` or `nvm ls` returns a node version of 12 or greater<br />
`npm run start:dev:local` boots up test chain, compiles & migrates contracts, starts IPFS daemon locally, starts up server
<br />
your server should be in the foreground, so you can still see server logs coming through <br />
`npm run create:pinEvent` submits a transaction to the network so the server can listen for events
