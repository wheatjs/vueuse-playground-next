import { io, Socket } from 'socket.io-client'
import {
  removeEmpty,

  BaseEvent,
  SocketEvent,
  PackageAddEvent,
  PackageRemoveEvent,

  EditorCursorEvent,
  EditorSelectionEvent,

  SyncFilesResponseEvent,
  SyncCollaboratorsEvent,

  RoomCreatedEvent,
  RoomJoinedEvent,

  CollaboratorDisconnetEvent,

  FileAddEvent,
  FileDeleteEvent,

  DocumentChangeEvent,
} from '@playground/shared'
import { editor as Editor } from 'monaco-editor'
import { useEditors } from './editors'
import { useCollaboration, usePackages, onAddPackage, onRemovePackage, filesystem, onFileCreated, onFileDeleted } from '~/store'
import { MonacoCollaborationManager } from '~/monaco/collaboration'
import { JsonFile, ScriptFile, SFCFile } from '~/store/filesystem/files'

const COLLABORATION_URL = (import.meta.env.VITE_COLLABORATION_SERVER as string) || 'ws://localhost:4000'

type EmitParameter<T> = Omit<T, 'sender' | 'timestamp'>

export interface FileEditor {
  editor: Editor.IStandaloneCodeEditor
  manager: MonacoCollaborationManager
}

export class CollaborationManager {
  private client: Socket
  private collaboration = useCollaboration()
  private editors = useEditors()
  private packages = usePackages()
  private fileEditors: Record<string, FileEditor> = {}
  private hasSynced = false
  private hasAttached = false
  private documentListeners: Array<{ off: () => void }> = []

  public connect(session?: string) {
    if (!this.client) {
      this.client = io(COLLABORATION_URL, {
        // @ts-ignore
        query: {
          ...removeEmpty({
            username: this.collaboration.username,
            session,
          }),
        },
      })
    }

    // this.attachEditors()
    if (!this.hasAttached) {
      this.attachEventListeners()
      this.hasAttached = true
    }

    this.client.connect()
  }

  public disconnect() {
    this.client.disconnect()
    this.collaboration.collaborators = []
    // this.fileEditors.forEach(({ manager }) => {
    //   manager.disconnect()
    //   manager.removeAllCursors()
    //   manager.removeAllSelections()
    // })
    // this.fileEditors = []
    this.hasSynced = false
  }

  private attachEventListeners() {
    this.client.on(SocketEvent.Connect, () => this.onConnect())
    this.client.on(SocketEvent.Disconnect, () => this.onDisconnect())

    this.client.on(SocketEvent.RoomCreated, (data: RoomCreatedEvent) => this.onRoomCreated(data))
    this.client.on(SocketEvent.RoomJoined, (data: RoomJoinedEvent) => this.onRoomJoined(data))
    this.client.on(SocketEvent.CollaboratorDisconnet, (data: CollaboratorDisconnetEvent) => this.onCollaboratorDisconnect(data))

    this.client.on(SocketEvent.SyncCollaborators, (data: SyncCollaboratorsEvent) => this.onSyncCollaborators(data))
    this.client.on(SocketEvent.SyncFilesRequest, (data: BaseEvent) => this.onSyncFilesRequest(data))
    this.client.on(SocketEvent.SyncFilesResponse, (data: SyncFilesResponseEvent) => this.onSyncFilesResponse(data))

    this.client.on(SocketEvent.PackageAdd, (data: PackageAddEvent) => this.onPackageAdd(data))
    this.client.on(SocketEvent.PackageRemove, (data: PackageRemoveEvent) => this.onPackageRemove(data))

    this.client.on(SocketEvent.EditorCursor, (data: EditorCursorEvent) => this.onEditorCursor(data))
    this.client.on(SocketEvent.EditorSelection, (data: EditorSelectionEvent) => this.onEditorSelection(data))

    this.client.on(SocketEvent.FileAdd, (data: FileAddEvent) => this.onFileAdd(data))
    this.client.on(SocketEvent.FileDelete, (data: FileDeleteEvent) => this.onFileDelete(data))

    this.client.on(SocketEvent.DocumentChange, (data: DocumentChangeEvent) => this.onDocumentChange(data))

    this.attachDocumentListeners()

    /**
     * Non-Socket Listeners
     */
    onAddPackage(name => this.emitPackageAddEvent({ name }))
    onRemovePackage(name => this.emitPackageRemoveEvent({ name }))

    onFileCreated((name) => {
      this.emitFileAddEvent({ file: filesystem.exportFile(filesystem.files[name]) })
      this.attachDocumentListeners()
    })
    onFileDeleted((name) => {
      this.emitFileDeleteEvent({ name })
      this.attachDocumentListeners()
    })

    Object.entries(this.editors.editors).forEach(([id, editor]) => {
      this.attachEditorListeners(id, editor)
    })

    this.editors.onEditorCreated(({ id, editor }) => {
      this.attachEditorListeners(id, editor)
    })

    this.editors.onEditorDestroyed(({ id }) => {
      this.removeEditorListeners(id)
    })
  }

  private attachDocumentListeners() {
    this.documentListeners.forEach(x => x.off())
    this.documentListeners = filesystem
      .documents
      .map((document) => {
        return document.onDocumentChange(({ name, changes }) => {
          this.emitDocumentChangeEvent({ filename: name, changes })
        })
      })
  }

  private removeEditorListeners(id: string) {
    if (this.fileEditors[id])
      this.fileEditors[id].manager.disconnect()
  }

  private attachEditorListeners(id: string, editor: Editor.IStandaloneCodeEditor) {
    this.fileEditors[id] = {
      editor,
      manager: new MonacoCollaborationManager(editor, {
        onCursor: (uri, offset) => { this.emitCursorEvent({ uri, offset }) },
        onSelect: (uri, offsetStart, offsetEnd) => { this.emitSelectionEvent({ uri, offsetStart, offsetEnd }) },
      }),
    }
  }

  private emit<T>(name: SocketEvent, payload?: Omit<T, 'sender' | 'timestamp'>) {
    this.client.emit(name, {
      sender: this.collaboration.id,
      timestamp: Date.now(),
      ...payload,
    } as BaseEvent)
  }

  private onConnect() { this.collaboration.isConnected = true }
  private onDisconnect() { this.collaboration.isConnected = false }

  private onCollaboratorDisconnect({ sender }: CollaboratorDisconnetEvent) {
    Object.values(this.fileEditors).forEach(({ manager }) => {
      manager.removeCursor(sender)
      manager.removeSelection(sender)
    })
  }

  private onRoomCreated({ session, id }: RoomCreatedEvent) {
    this.collaboration.session = session
    this.collaboration.id = id
    this.hasSynced = true
  }

  private onRoomJoined({ id, session }: RoomJoinedEvent) {
    this.collaboration.id = id
    this.collaboration.session = session
    this.emitFileSyncRequest()
  }

  private onSyncCollaborators({ collaborators }: SyncCollaboratorsEvent) {
    this.collaboration.collaborators = collaborators
  }

  private onDocumentChange({ filename, changes }: DocumentChangeEvent) {
    // Document file names are delmieted by [filename]:[type], so we can get the name
    // and type by splitting along that
    const [name, type] = filename.split(':')

    if (type === 'template')
      (filesystem.files[name] as SFCFile).template.onReceiveDocumentChanges(changes)

    if (type === 'script')
      (filesystem.files[name] as ScriptFile).script.onReceiveDocumentChanges(changes)

    if (type === 'json')
      (filesystem.files[name] as JsonFile).json.onReceiveDocumentChanges(changes)
  }

  private onSyncFilesRequest({ sender }: BaseEvent) {
    this.emitFileSyncResponse({
      to: sender,
      activeFilename: filesystem.currentFile.filename,
      files: filesystem.exportFiles(),
    })
  }

  private onSyncFilesResponse({ files }: SyncFilesResponseEvent) {
    filesystem.importFiles(files)
    this.attachDocumentListeners()
  }

  private onFileAdd({ file }: FileAddEvent) {
    filesystem.importFile(file)
    this.attachDocumentListeners()
  }

  private onFileDelete({ name }: FileDeleteEvent) {
    filesystem.deleteFile(name, true)
  }

  private onPackageAdd({ name }: PackageAddEvent) {
    this.packages.addPackage(name)
  }

  private onPackageRemove({ name }: PackageRemoveEvent) {
    this.packages.removePackage(name)
  }

  private onEditorCursor(data: EditorCursorEvent) {
    // Find the editor manager with the same uri

    Object.values(this.fileEditors).forEach(({ manager }) => {
      if (manager.uri === data.uri) {
        manager.setCursorPosition(data.sender, this.getUsernameById(data.sender), '#16a34a', data.offset)
        manager.showCursor(data.sender)
      }
      else {
        manager.hideCursor(data.sender)
      }
    })
  }

  private onEditorSelection(data: EditorSelectionEvent) {
    Object.values(this.fileEditors).forEach(({ manager }) => {
      if (manager.uri === data.uri)
        manager.setSelection(data.sender, '#16a34a', data.offsetStart, data.offsetEnd)

      // else
      //   manager.removeSelection(data.sender)
    })
  }

  public emitCursorEvent(data: EmitParameter<EditorCursorEvent>) {
    this.emit(SocketEvent.EditorCursor, data)
  }

  public emitSelectionEvent(data: EmitParameter<EditorSelectionEvent>) {
    this.emit(SocketEvent.EditorSelection, data)
  }

  public emitDocumentChangeEvent(data: EmitParameter<DocumentChangeEvent>) {
    this.emit(SocketEvent.DocumentChange, data)
  }

  public emitFileSyncRequest() {
    this.emit(SocketEvent.SyncFilesRequest)
  }

  public emitFileSyncResponse(data: EmitParameter<SyncFilesResponseEvent>) {
    this.emit(SocketEvent.SyncFilesResponse, data)
  }

  public emitPackageAddEvent(data: EmitParameter<PackageAddEvent>) {
    this.emit(SocketEvent.PackageAdd, data)
  }

  public emitPackageRemoveEvent(data: EmitParameter<PackageRemoveEvent>) {
    this.emit(SocketEvent.PackageRemove, data)
  }

  public emitEditorCursorEvent(data: EmitParameter<EditorCursorEvent>) {
    if (!this.hasSynced)
      return

    this.emit(SocketEvent.EditorCursor, data)
  }

  public emitEditorSelectionEvent(data: EmitParameter<EditorSelectionEvent>) {
    if (!this.hasSynced)
      return

    this.emit(SocketEvent.EditorSelection, data)
  }

  public emitFileAddEvent(data: EmitParameter<FileAddEvent>) {
    this.emit(SocketEvent.FileAdd, data)
  }

  public emitFileDeleteEvent(data: EmitParameter<FileDeleteEvent>) {
    // if (!this.hasSynced)
    //   return

    this.emit(SocketEvent.FileDelete, data)
  }

  private getUsernameById(id: string) {
    return this.collaboration.collaborators.find(user => user.id === id)?.username || id
  }
}