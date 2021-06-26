import { createServer } from 'http'
import { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import { Collaborator, RoomCreatedEvent, RoomJoinedEvent, SocketEvent, SyncCollaboratorsEvent } from '@playground/shared'
import express, { Router } from 'express'
import { json } from 'body-parser'

import dbRoutes from './routes'

const routes = Router()
routes.use('/playgrounds', dbRoutes)

const app = express()
app.use(json())
app.use(routes)

const server = createServer(app)

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
    socket.emit(SocketEvent.RoomJoined, { id: socket.id, sender: 'server', timestamp: Date.now() } as RoomJoinedEvent)

    const usersInRoom = (await io.in(session).fetchSockets())

    if (usersInRoom) {
      const users: Collaborator[] = usersInRoom.map(user => ({ id: user.id, username: (user.handshake.query.username as string) }))
      io.to(session).emit(SocketEvent.SyncCollaborators, { collaborators: users } as SyncCollaboratorsEvent)
    }
  }
  else {
    session = nanoid(8)
    socket.join(session)
    socket.emit(SocketEvent.RoomCreated, { id: socket.id, sender: 'server', timestamp: Date.now(), session } as RoomCreatedEvent)
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

  socket.on('disconnect', async() => {
    const usersInRoom = (await io.in(session).fetchSockets())

    if (usersInRoom) {
      const users: Collaborator[] = usersInRoom.map(user => ({ id: user.id, username: (user.handshake.query.username as string) }))
      io.to(session).emit(SocketEvent.SyncCollaborators, { collaborators: users } as SyncCollaboratorsEvent)
    }
  })
})

server.listen(4000)
