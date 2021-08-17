export enum SocketEvent {
  Connect = 'connect',
  Disconnect = 'disconnect',

  RoomCreated = 'room-created',
  RoomJoined = 'room-joined',

  CollaboratorDisconnet = 'collaborator-disconnect',

  SyncCollaborators = 'sync-collaborators',
  SyncFilesRequest = 'sync-files-request',
  SyncFilesResponse = 'sync-files-response',

  PackageAdd = 'package-add',
  PackageRemove = 'package-remove',

  DocumentChange = 'document-change',

  EditorCursor = 'editor-cursor',
  EditorSelection = 'editor-selection',

  FileAdd = 'file-add',
  FileRename = 'file-rename',
  FileDelete = 'file-delete',
}

export interface Collaborator {
  id: string
  username: string
}

interface ExportedFile {
  template: string
  script: string
  style: string
  filename: string
}

export interface FileExports {
  activeFilename: string
  files: ExportedFile[]
}

export type SFCType = 'template' | 'script' | 'style'

export interface BaseEvent {
  sender: string
  timestamp: number
}

export interface CollaboratorDisconnetEvent extends BaseEvent {

}

export interface FileOperationEvent extends BaseEvent {
  uri: string
}

export interface PackageAddEvent extends BaseEvent {
  name: string
  version?: string
}

export interface PackageRemoveEvent extends BaseEvent {
  name: string
}

export interface RoomCreatedEvent extends BaseEvent {
  id: string
  session: string
}

export interface RoomJoinedEvent extends BaseEvent {
  id: string
  session: string
}

export interface SyncCollaboratorsEvent extends BaseEvent {
  collaborators: Collaborator[]
}

export interface SyncFilesRequestEvent<T> extends BaseEvent {
  files: T
}

export interface DocumentChangeEvent extends BaseEvent {
  filename: string
  changes: any
}

export interface SyncFilesResponseEvent extends BaseEvent, FileExports {
  to: string
  files: any[]
}

export interface EditorCursorEvent extends FileOperationEvent {
  offset: number
}

export interface EditorSelectionEvent extends FileOperationEvent {
  offsetStart: number
  offsetEnd: number
}

export interface FileAddEvent extends BaseEvent {
  file: any
}

export interface FileRenameEvent extends BaseEvent {
  oldName: string
  newName: string
}

export interface FileDeleteEvent extends BaseEvent {
  name: string
}
