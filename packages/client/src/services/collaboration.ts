import { io, Socket } from 'socket.io-client'
import { SocketEvent, removeEmpty, PackageAddEvent, PackageRemoveEvent, EditorInsertEvent, EditorDeleteEvent, EditorReplaceEvent, EditorCursorEvent, BaseEvent, EditorSelectionEvent, SyncFilesRequestEvent, SyncFilesResponseEvent, SyncCollaboratorsEvent, SFCType, RoomCreatedEvent, RoomJoinedEvent, CollaboratorDisconnetEvent, insertAt, deleteAt, FileAddEvent, FileDeleteEvent } from '@playground/shared'
import { editor as Editor } from 'monaco-editor'
import { useCollaboration, usePackages, onAddPackage, onRemovePackage, exportFiles, importFiles, playground, onCreateFile, onDeleteFile, createFile, File, deleteFile } from '~/store'
import { editors } from '~/store/editors'
import { MonacoCollaborationManager } from '~/monaco/collaboration'
import { compileFile } from '~/preview/compiler'

type EmitParameter<T> = Omit<T, 'sender' | 'timestamp'>

export interface FileEditor {
  editor: Editor.IStandaloneCodeEditor
  type: SFCType
  manager: MonacoCollaborationManager
}

export class CollaborationManager {
  private client: Socket
  private username: string
  private collaboration = useCollaboration()
  private packages = usePackages()
  private fileEditors: FileEditor[] = []
  private hasSynced = false
  private hasAttached = false

  constructor() {
    this.username = this.collaboration.username
    // this.client = io('')
  }

  public connect(session?: string) {
    if (!this.client) {
      this.client = io('ws://localhost:4000', {
        // @ts-ignore
        query: {
          ...removeEmpty({
            username: this.username,
            session,
          }),
        },
      })
    }

    this.attachEditors()
    if (!this.hasAttached) {
      this.attachEventListeners()
      this.hasAttached = true
    }

    this.client.connect()
  }

  public disconnect() {
    this.client.disconnect()
    this.collaboration.collaborators = []
    this.fileEditors.forEach(({ manager }) => {
      manager.disconnect()
      manager.removeAllCursors()
      manager.removeAllSelections()
    })
    this.fileEditors = []
    this.hasSynced = false
  }

  private attachEditors() {
    editors.forEach(({ editor, type }) => {
      this.fileEditors.push({
        editor,
        type,
        manager: new MonacoCollaborationManager(
          editor,
          type,
          {
            onCursor: offset => this.emitEditorCursorEvent({
              filename: playground.activeFilename,
              offset,
              sfcType: type,
            }),
            onSelect: (startOffset, endOffset) => this.emitEditorSelectionEvent({
              filename: playground.activeFilename,
              offsetStart: startOffset,
              offsetEnd: endOffset,
              sfcType: type,
            }),
            onInsert: (index, text) => this.emitEditorInsertEvent({
              filename: playground.activeFilename,
              index,
              text,
              sfcType: type,
            }),
            onDelete: (index, length) => this.emitEditorDeleteEvent({
              filename: playground.activeFilename,
              index,
              length,
              sfcType: type,
            }),
            onReplace: (index, length, text) => this.emitEditorReplaceEvent({
              filename: playground.activeFilename,
              index,
              length,
              text,
              sfcType: type,
            }),
          },
        ),
      })
    })
  }

  private attachEventListeners() {
    this.client.on(SocketEvent.Connect, () => this.onConnect())
    this.client.on(SocketEvent.Disconnect, () => this.onDisconnect())

    this.client.on(SocketEvent.RoomCreated, (data: RoomCreatedEvent) => this.onRoomCreated(data))
    this.client.on(SocketEvent.RoomJoined, (data: RoomJoinedEvent) => this.onRoomJoined(data))
    this.client.on(SocketEvent.CollaboratorDisconnet, (data: CollaboratorDisconnetEvent) => this.onCollaboratorDisconnect(data))

    this.client.on(SocketEvent.SyncCollaborators, (data: SyncCollaboratorsEvent) => this.onSyncCollaborators(data))
    this.client.on(SocketEvent.SyncFilesRequest, (data: SyncFilesRequestEvent) => this.onSyncFilesRequest(data))
    this.client.on(SocketEvent.SyncFilesResponse, (data: SyncFilesResponseEvent) => this.onSyncFilesResponse(data))

    this.client.on(SocketEvent.PackageAdd, (data: PackageAddEvent) => this.onPackageAdd(data))
    this.client.on(SocketEvent.PackageRemove, (data: PackageRemoveEvent) => this.onPackageRemove(data))

    this.client.on(SocketEvent.EditorInsert, (data: EditorInsertEvent) => this.onEditorInsert(data))
    this.client.on(SocketEvent.EditorDelete, (data: EditorDeleteEvent) => this.onEditorDelete(data))
    this.client.on(SocketEvent.EditorReplace, (data: EditorReplaceEvent) => this.onEditorReplace(data))
    this.client.on(SocketEvent.EditorCursor, (data: EditorCursorEvent) => this.onEditorCursor(data))
    this.client.on(SocketEvent.EditorSelection, (data: EditorSelectionEvent) => this.onEditorSelection(data))

    this.client.on(SocketEvent.FileAdd, (data: FileAddEvent) => this.onFileAdd(data))
    this.client.on(SocketEvent.FileDelete, (data: FileAddEvent) => this.onFileDelete(data))

    /**
     * Non-Socket Listeners
     */
    onAddPackage(name => this.emitPackageAddEvent({ name }))
    onRemovePackage(name => this.emitPackageRemoveEvent({ name }))

    onCreateFile(data => this.emitFileAddEvent({ name: data.filename, script: data.script, template: data.template, style: data.style }))
    onDeleteFile(name => this.emitFileDeleteEvent({ name }))
  }

  private emit<T>(name: SocketEvent, payload: Omit<T, 'sender' | 'timestamp'>) {
    this.client.emit(name, {
      sender: this.collaboration.id,
      timestamp: Date.now(),
      ...payload,
    } as BaseEvent)
  }

  private shouldUpdateEditor(filename: string) {
    return filename === playground.activeFilename
  }

  private onConnect() {
    this.collaboration.isConnected = true
  }

  private onDisconnect() {
    this.collaboration.isConnected = false
  }

  private onCollaboratorDisconnect({ sender }: CollaboratorDisconnetEvent) {
    this.fileEditors.forEach(({ manager }) => {
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
    this.emitFileSyncRequest({})
  }

  private onSyncCollaborators({ collaborators }: SyncCollaboratorsEvent) {
    this.collaboration.collaborators = collaborators
  }

  private onSyncFilesRequest({ sender }: SyncFilesRequestEvent) {
    this.emitFileSyncResponse({
      to: sender,
      ...exportFiles(),
    })
  }

  private onSyncFilesResponse({ activeFilename, files }: SyncFilesResponseEvent) {
    importFiles({
      files,
      activeFilename,
    })

    setTimeout(() => this.hasSynced = true, 100)
  }

  private onPackageAdd({ name }: PackageAddEvent) {
    this.packages.addPackage(name)
  }

  private onPackageRemove({ name }: PackageRemoveEvent) {
    this.packages.removePackage(name)
  }

  private onEditorInsert({ index, text, sfcType, filename }: EditorInsertEvent) {
    if (!this.shouldUpdateEditor(filename)) {
      const source = playground.files[filename][sfcType]
      playground.files[filename][sfcType] = insertAt(source, index, text)
      compileFile(playground.files[filename])
      return
    }

    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.insertContent(index, text)
      })
  }

  private onEditorDelete({ index, length, sfcType, filename }: EditorDeleteEvent) {
    if (!this.shouldUpdateEditor(filename)) {
      const source = playground.files[filename][sfcType]
      playground.files[filename][sfcType] = deleteAt(source, index, length)
      compileFile(playground.files[filename])
      return
    }

    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.deleteContent(index, length)
      })
  }

  private onEditorReplace({ index, length, text, sfcType, filename }: EditorReplaceEvent) {
    if (!this.shouldUpdateEditor(filename)) {
      const deleted = deleteAt(playground.files[filename][sfcType], index, length)
      playground.files[filename][sfcType] = insertAt(deleted, index, text)
      compileFile(playground.files[filename])
      return
    }

    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.replaceContent(index, length, text)
      })
  }

  private onEditorCursor({ offset, sender, sfcType, filename }: EditorCursorEvent) {
    if (!this.shouldUpdateEditor(filename)) {
      this.fileEditors
        .filter(({ type }) => type === sfcType)
        .forEach(({ manager }) => {
          manager.hideCursor(sender)
        })
      return
    }

    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.setCursorPosition(sender, this.getUsernameById(sender), 'red', offset)
        manager.showCursor(sender)
      })
  }

  private onEditorSelection({ sender, offsetStart, offsetEnd, sfcType, filename }: EditorSelectionEvent) {
    if (!this.shouldUpdateEditor(filename))
      return

    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.setSelection(sender, 'red', offsetStart, offsetEnd)
      })
  }

  private onFileAdd({ name, script, style, template }: FileAddEvent) {
    createFile(new File(name, template, script, style), true)
  }

  private onFileDelete({ name }: FileDeleteEvent) {
    deleteFile(name, true)
  }

  public emitFileSyncRequest(data: EmitParameter<SyncFilesRequestEvent>) {
    this.emit(SocketEvent.SyncFilesRequest, data)
  }

  public emitFileSyncResponse(data: EmitParameter<SyncFilesResponseEvent>) {
    this.emit(SocketEvent.SyncFilesResponse, data)
  }

  // public emitSyncPackagesRequest(data: EmitParameter<SyncFilesRequestEvent>) {
  //   this.emit(SocketEvent.SyncFilesRequest, data)
  // }

  // public emitSyncPackagesResponse(data: EmitParameter<SyncFilesResponseEvent>) {
  //   this.emit(SocketEvent.SyncFilesResponse, data)
  // }

  public emitPackageAddEvent(data: EmitParameter<PackageAddEvent>) {
    this.emit(SocketEvent.PackageAdd, data)
  }

  public emitPackageRemoveEvent(data: EmitParameter<PackageRemoveEvent>) {
    this.emit(SocketEvent.PackageRemove, data)
  }

  public emitEditorInsertEvent(data: EmitParameter<EditorInsertEvent>) {
    if (!this.hasSynced || this.collaboration.suppressContentEvent)
      return

    this.emit(SocketEvent.EditorInsert, data)
  }

  public emitEditorDeleteEvent(data: EmitParameter<EditorDeleteEvent>) {
    if (!this.hasSynced || this.collaboration.suppressContentEvent)
      return

    this.emit(SocketEvent.EditorDelete, data)
  }

  public emitEditorReplaceEvent(data: EmitParameter<EditorReplaceEvent>) {
    if (!this.hasSynced || this.collaboration.suppressContentEvent)
      return

    this.emit(SocketEvent.EditorReplace, data)
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
    if (!this.hasSynced)
      return

    this.emit(SocketEvent.FileAdd, data)
  }

  public emitFileDeleteEvent(data: EmitParameter<FileDeleteEvent>) {
    if (!this.hasSynced)
      return

    this.emit(SocketEvent.FileDelete, data)
  }

  private getUsernameById(id: string) {
    return this.collaboration.collaborators.find(user => user.id === id)?.username || id
  }
}
