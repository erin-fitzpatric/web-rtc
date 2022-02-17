const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs');

// Demo certs provided - you will need to provide your own secure certs for production use
const options = {
    cert: fs.readFileSync('./demo-certs/dummy.crt'),
    key: fs.readFileSync('./demo-certs/dummy.key'),
}

const server = https.createServer(options, app)

const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)