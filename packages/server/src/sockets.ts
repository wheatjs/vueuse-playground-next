import { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import { Collaborator, CollaboratorDisconnetEvent, RoomCreatedEvent, RoomJoinedEvent, SocketEvent, SyncCollaboratorsEvent, SyncFilesRequestEvent, SyncFilesResponseEvent } from '@playground/shared'

const reserved = [
  'connect',
  'connect_error',
  'disconnect',
  'disconnecting',
  'newListener',
  'removeListener',
  SocketEvent.SyncFilesRequest,
  SocketEvent.SyncFilesResponse,
]

export async function registerSockets(io: Server) {
  io.on('connection', async(socket) => {
    let username: any
    let session: any
    ({ username, session } = socket.handshake.query) // eslint-disable-line prefer-const
    socket.data.timestamp = Date.now()

    if (session) {
      socket.join(session)
      socket.emit(SocketEvent.RoomJoined, { id: socket.id, sender: 'server', timestamp: Date.now(), session } as RoomJoinedEvent)

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

    socket.on(SocketEvent.SyncFilesRequest, async(data: SyncFilesRequestEvent) => {
      // Find the socket user who has been here the longest
      // and get the files from them
      const usersInRoom = (await io.in(session).fetchSockets())

      usersInRoom.sort((x, y) => x.data.timestamp - y.data.timestamp)
      usersInRoom[0].emit(SocketEvent.SyncFilesRequest, data)
    })

    socket.on(SocketEvent.SyncFilesResponse, async(data: SyncFilesResponseEvent) => {
      // Send the files to the appropriate socket
      const usersInRoom = (await io.in(session).fetchSockets())

      usersInRoom.find(({ id }) => id === data.to)?.emit(SocketEvent.SyncFilesResponse, data)
    })

    socket.on('disconnect', async() => {
      io.to(session).emit(SocketEvent.CollaboratorDisconnet, { sender: socket.id, timestamp: Date.now() } as CollaboratorDisconnetEvent)

      const usersInRoom = (await io.in(session).fetchSockets())
      if (usersInRoom) {
        const users: Collaborator[] = usersInRoom.map(user => ({ id: user.id, username: (user.handshake.query.username as string) }))
        io.to(session).emit(SocketEvent.SyncCollaborators, { collaborators: users } as SyncCollaboratorsEvent)
      }
    })
  })
}
