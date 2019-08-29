const express = require('express')
const open = require('open')
const app = express()
const port = 3001

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
  open('http://localhost:' + port);
})

