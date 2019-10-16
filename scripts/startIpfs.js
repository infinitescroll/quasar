const exec = require('child_process').execSync
require('dotenv').config({ path: __dirname + '/.env' })

if (!process.env.IPFS_NODE_HOST) exec('jsipfs daemon', console.log)
