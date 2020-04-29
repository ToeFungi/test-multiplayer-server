import cors from 'cors'
import express from 'express'
import socketIO from 'socket.io'

import { createServer } from 'http'

import { PlayerController } from './PlayerController'
import { BulletController } from './BulletController'

const fps = process.env.SET_FPS || 25
const port = process.env.SERVER_PORT || 3001

const app = express()
app.use(cors())

const server = createServer(app)
const io = socketIO(server)

const playerController = new PlayerController()
const bulletController = new BulletController()

server.listen(port, () => console.log(`Server listening on port ${port}`))

// On connection to the server
io.on('connection', socket => {
  playerController.onConnect(socket)

  // Emit player details
  socket.emit('player-details', {
    name: playerController.getPlayerBySocketId(socket.id)
      .getName()
  })

  // On socket disconnect, remove player
  socket.on('disconnect', () => playerController.onDisconnect(socket))

  // Handle keypress events from client
  socket.on('key-press', data => playerController.handleKeyEvents(data, socket.id))

  // Handle of messages
  socket.on('create-message', ({ message }) => {
    const username = playerController.getPlayerBySocketId(socket.id)
      .getName()
    io.emit('message-update', { message, username })
  })

  // Handle ping
  socket.on('custom-ping', data => socket.emit('custom-ping', data))
})

// Game loop set to x frames per second
const gameLoop = setInterval(() => {
  const player = playerController.updatePlayers()
  const bullet = bulletController.updateBullets()

  const updatePacket = {
    player,
    bullet
  }

  // Emit game loop update to connected sockets
  io.emit('loop-update', { updatePacket })
}, 1000 / fps)
