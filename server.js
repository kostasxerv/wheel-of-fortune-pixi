const express = require('express')
const fs = require('fs')
const open = require('open')
const app = express()
const port = 3001
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
  open('http://localhost:' + port)
})

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
})

fs.watch('./public/js', () => {
  wss.clients.forEach(c => c.send(JSON.stringify({ action: 'reload' })))
})
