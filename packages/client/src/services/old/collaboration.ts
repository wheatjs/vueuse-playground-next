/**
 * I wrote all this and still have no idea what is going on
 */

import Peer from '@wheatjs/peerjs'
import { useCollaboration, usePackages, exportFiles, importFiles } from '~/store'
import { MonacoCollaborationManager } from '~/monaco/collaboration'
import { editors } from '~/store/editors'
import names from '~/data/names.json'

interface PeerMessage {
  id?: string
  type: string
  payload: {
    [key: string]: any
  }
}

interface PeerConnection {
  id: string
  connection: Peer.DataConnection
}

interface PeerEditor {
  type: string
  manager: MonacoCollaborationManager
}

export class CollaborationManager {
  private collaborators = useCollaboration()
  private packages = usePackages()
  private peer: Peer
  private connections: PeerConnection[] = []
  private name = names[Math.floor(Math.random() * names.length)]
  private editors: PeerEditor[] = []

  constructor() {
    this.peer = new Peer(this.collaborators.id, { debug: 2 })

    this.peer.on('open', () => this.collaborators.isOpen = true)
    this.peer.on('close', () => this.collaborators.isOpen = false)

    this.broadcast = this.broadcast.bind(this)
  }

  public open() {
    this.peer.on('connection', (connection) => {
      connection.on('open', () => {
        const { files, activeFilename } = exportFiles()
        connection.send({
          type: 'metadata-sync',
          payload: {
            packages: this.packages.packages,
            files,
            activeFilename,
          },
        } as PeerMessage)

        this.syncUsers()

        // Hook up editors
        editors.forEach(({ type, editor }) => {
          this.editors.push({
            type,
            manager: new MonacoCollaborationManager(editor as any, this.broadcast, type),
          })
        })
      })

      connection.on('data', (data: PeerMessage) => {
        this.onMessage(data)
      })

      this.connections = [
        ...this.connections,
        {
          id: connection.metadata.id,
          connection,
        },
      ]

      this.collaborators.addCollaborator({
        id: connection.metadata.id,
        name: connection.metadata.name,
      })

      connection.on('close', () => {
        this.connections = this.connections.filter(({ id }) => id !== connection.metadata.id)
        this.collaborators.removeCollaborator(connection.metadata.id)
        this.syncUsers()
      })
    })
  }

  public connect(id: string) {
    const connection = this.peer.connect(id, {
      metadata: {
        id: this.collaborators.id,
        name: names[Math.floor(Math.random() * names.length)],
      },
    })

    connection.on('open', () => {
      console.log('Successfully Connected to', id)

      // Hook up editors
      editors.forEach(({ type, editor }) => {
        this.editors.push({
          type,
          manager: new MonacoCollaborationManager(editor as any, (message: PeerMessage) => this.broadcast(message, connection), type),
        })
      })
    })

    connection.on('data', (data: PeerMessage) => {
      this.onMessage(data)
    })

    connection.on('close', () => {
      this.collaborators.collaborators = []
    })

    window.onbeforeunload = () => connection.close()
  }

  public broadcast(message: PeerMessage, connection?: Peer.DataConnection) {
    console.log(`Broadcasting Message from ${this.collaborators.id} to ${this.connections.map(({ id }) => id).join(', ')}`)

    if (connection) {
      connection.send({
        id: this.collaborators.id,
        ...message,
      })
    }
    else {
      this.connections.forEach((connection) => {
        connection.connection.send({
          id: this.collaborators.id,
          ...message,
        })
      })
    }
  }

  private onMessage(message: PeerMessage) {
    console.log('Me', this.collaborators.id)
    console.log(message)

    if (message.type === 'metadata-sync') {
      message.payload.packages.forEach(({ name }) => this.packages.addPackage(name))
      importFiles({
        activeFilename: message.payload.activeFilename,
        files: message.payload.files,
      })
    }

    if (message.type === 'users-sync')
      this.collaborators.collaborators = message.payload.collaborators

    if (message.type === 'editor') {
      this.editors
        .forEach(
          x => x
            .manager
            .handleEditorEvent(
              message.payload,
              message.id!,
              this.collaborators.collaborators.find(z => z.id === message.id)?.name,
            ),
        )
    }
  }

  public disconnect() {

  }

  private syncUsers() {
    this.broadcast({
      type: 'users-sync',
      payload: {
        collaborators: [
          ...this.collaborators.collaborators,
          {
            id: this.collaborators.id,
            name: this.name,
          },
        ],
      },
    })
  }
}
