import express from 'express'
import SocketIO from 'socket.io'
import http from 'http'

const app = express()

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')
app.use('/public', express.static(__dirname + '/public'))
app.get('/', (_, res) => res.render('home'))
app.get('/*', (_, res) => res.redirect('/'))

const httpServer = http.createServer(app)
const wsServer = SocketIO(httpServer)

wsServer.on('connection', (socket) => {
  socket['userName'] = 'anonymous'

  socket.on('enter', (userName, roomName) => {
    socket['userName'] = userName
    socket.join(roomName)
    socket.to(roomName).emit('welcome', socket.userName, roomName)
  })

  socket.on('transform', (roomName, targetId, property, value) => {
    const updatedAt = socket.handshake.time.split(' ')[4]
    socket.to(roomName).emit('transform', socket.userName, targetId, property, value, updatedAt)
  })
})

const handleListen = () => {
  console.log('Listening on http://localhost:3000')
}

httpServer.listen(3000, handleListen)
