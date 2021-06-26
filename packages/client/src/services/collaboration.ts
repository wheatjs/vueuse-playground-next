import { io, Socket } from 'socket.io-client'
import { SocketEvent, removeEmpty, PackageAddEvent, PackageRemoveEvent, EditorInsertEvent, EditorDeleteEvent, EditorReplaceEvent, EditorCursorEvent, BaseEvent, EditorSelectionEvent, SyncFilesRequestEvent, SyncFilesResponseEvent, SyncCollaboratorsEvent, SFCType, RoomCreatedEvent, RoomJoinedEvent } from '@playground/shared'
import { editor as Editor } from 'monaco-editor'
import { useCollaboration, playground } from '~/store'
import { editors } from '~/store/editors'
import { MonacoCollaborationManager } from '~/monaco/collaboration'

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
  private fileEditors: FileEditor[] = []

  constructor() {
    this.username = this.collaboration.username
    this.client = io('')
  }

  public connect(session?: string) {
    this.client = io('ws://localhost:4000', {
      // @ts-ignore
      query: {
        ...removeEmpty({
          username: this.username,
          session,
        }),
      },
    })

    this.attachEditors()
    this.attachEventListeners()
    this.client.connect()
  }

  public disconnect() {
    this.client.disconnect()
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
            onCursor: offset => this.emitEditorCursorEvent({ filename: 'App.vue', offset, sfcType: type }),
            onSelect: (startOffset, endOffset) => this.emitEditorSelectionEvent({
              filename: 'App.vue',
              offsetStart: startOffset,
              offsetEnd: endOffset,
              sfcType: type,
            }),
            onInsert: (index, text) => this.emitEditorInsertEvent({
              filename: 'App.vue',
              index,
              text,
              sfcType: type,
            }),
            onDelete: (index, length) => this.emitEditorDeleteEvent({
              filename: 'App.vue',
              index,
              length,
              sfcType: type,
            }),
            onReplace: (index, length, text) => this.emitEditorReplaceEvent({
              filename: 'App.vue',
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
  }

  private emit<T>(name: SocketEvent, payload: Omit<T, 'sender' | 'timestamp'>) {
    this.client.emit(name, {
      sender: this.username,
      timestamp: Date.now(),
      ...payload,
    } as BaseEvent)
  }

  private onConnect() {
    this.collaboration.isConnected = true
  }

  private onDisconnect() {
    this.collaboration.isConnected = false
  }

  private onRoomCreated({ session }: RoomCreatedEvent) {
    this.collaboration.session = session
  }

  private onRoomJoined(data: RoomJoinedEvent) {
    // TODO
  }

  private onSyncCollaborators({ collaborators }: SyncCollaboratorsEvent) {
    this.collaboration.collaborators = collaborators
  }

  private onSyncFilesRequest(data: SyncFilesRequestEvent) {
    // TODO
  }

  private onSyncFilesResponse(data: SyncFilesResponseEvent) {
    // TODO
  }

  private onPackageAdd(data: PackageAddEvent) {
    // TODO
  }

  private onPackageRemove(data: PackageRemoveEvent) {
    // TODO
  }

  private onEditorInsert({ index, text, sfcType }: EditorInsertEvent) {
    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.insertContent(index, text)
      })
  }

  private onEditorDelete({ index, length, sfcType }: EditorDeleteEvent) {
    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.deleteContent(index, length)
      })
  }

  private onEditorReplace({ index, length, text, sfcType }: EditorReplaceEvent) {
    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.replaceContent(index, length, text)
      })
  }

  private onEditorCursor({ offset, sender, sfcType }: EditorCursorEvent) {
    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.setCursorPosition(sender, sender, 'red', offset)
      })
  }

  private onEditorSelection({ sender, offsetStart, offsetEnd, sfcType }: EditorSelectionEvent) {
    this.fileEditors
      .filter(({ type }) => type === sfcType)
      .forEach(({ manager }) => {
        manager.setSelection(sender, 'red', offsetStart, offsetEnd)
      })
  }

  public emitSyncPackagesRequest(data: EmitParameter<SyncFilesRequestEvent>) {
    this.emit(SocketEvent.SyncFilesRequest, data)
  }

  public emitSyncPackagesResponse(data: EmitParameter<SyncFilesResponseEvent>) {
    this.emit(SocketEvent.SyncFilesResponse, data)
  }

  public emitPackageAddEvent(data: EmitParameter<PackageAddEvent>) {
    this.emit(SocketEvent.PackageAdd, data)
  }

  public emitPackageRemoveEvent(data: EmitParameter<PackageRemoveEvent>) {
    this.emit(SocketEvent.PackageRemove, data)
  }

  public emitEditorInsertEvent(data: EmitParameter<EditorInsertEvent>) {
    this.emit(SocketEvent.EditorInsert, data)
  }

  public emitEditorDeleteEvent(data: EmitParameter<EditorDeleteEvent>) {
    this.emit(SocketEvent.EditorDelete, data)
  }

  public emitEditorReplaceEvent(data: EmitParameter<EditorReplaceEvent>) {
    this.emit(SocketEvent.EditorReplace, data)
  }

  public emitEditorCursorEvent(data: EmitParameter<EditorCursorEvent>) {
    this.emit(SocketEvent.EditorCursor, data)
  }

  public emitEditorSelectionEvent(data: EmitParameter<EditorSelectionEvent>) {
    this.emit(SocketEvent.EditorSelection, data)
  }
}
