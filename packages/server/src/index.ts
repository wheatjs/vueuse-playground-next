import { createServer } from 'http'
import { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import { SocketEvent } from '@playground/shared'

const server = createServer()
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const reserved = [
  'connect',
  'connect_error',
  'disconnect',
  'disconnecting',
  'newListener',
  'removeListener',
]

io.on('connection', async(socket) => {
  let username: any
  let session: any
  ({ username, session } = socket.handshake.query) // eslint-disable-line prefer-const

  if (session) {
    socket.join(session)
    socket.emit(SocketEvent.RoomJoined)
    const users = (await io.in(session).fetchSockets())
      .map(room => room.handshake.query.username)
    io.to(session).emit(SocketEvent.SyncCollaborators, users)
  }
  else {
    session = nanoid(8)
    console.log(session)
    socket.join(session)
    socket.emit(SocketEvent.RoomCreated, { session })
  }

  socket.onAny((eventName, data) => {
    if (reserved.includes(eventName))
      return

    socket.broadcast.to(session).emit(eventName, {
      id: socket.id,
      username,
      ...data,
    })
  })

  socket.on('disconnected', async() => {
    const users = (await io.in(session).fetchSockets())
      .map(room => room.handshake.query.username)

    io.to(session).emit(SocketEvent.SyncCollaborators, users)
  })
})

server.listen(4000)
