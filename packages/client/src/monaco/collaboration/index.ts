import { EditorContentManager, RemoteCursorManager, RemoteSelectionManager } from '@convergencelabs/monaco-collab-ext'
import { RemoteCursor } from '@convergencelabs/monaco-collab-ext/typings/RemoteCursor'
import { RemoteSelection } from '@convergencelabs/monaco-collab-ext/typings/RemoteSelection'
import { SFCType } from '@playground/shared'
import { editor as Editor } from 'monaco-editor'

export interface MonacoCollaborationManagerEvents {
  onReplace: (index: number, length: number, text: string) => void
  onInsert: (index: number, text: string) => void
  onDelete: (index: number, length: number) => void
  onSelect: (startOffset: number, endOffset: number) => void
  onCursor: (offset: number) => void
}

export class MonacoCollaborationManager {
  private editor: Editor.ICodeEditor
  private contentManager: EditorContentManager
  private cursorManager: RemoteCursorManager
  private selectionManager: RemoteSelectionManager
  private cursors: Record<string, RemoteCursor> = {}
  private selections: Record<string, RemoteSelection> = {}
  private type: SFCType

  constructor(editor: Editor.ICodeEditor, type: SFCType, events: MonacoCollaborationManagerEvents) {
    this.editor = editor
    this.type = type

    this.editor.onDidChangeCursorPosition((e) => {
      const model = this.editor.getModel()

      if (model) {
        const offset = model.getOffsetAt(e.position)
        events.onCursor(offset)
      }
    })
    this.editor.onDidChangeCursorSelection((e) => {
      const model = this.editor.getModel()

      if (model) {
        const startOffset = model.getOffsetAt(e.selection.getStartPosition())
        const endOffset = model.getOffsetAt(e.selection.getEndPosition())
        events.onSelect(startOffset, endOffset)
      }
    })

    this.contentManager = new EditorContentManager({
      editor,
      onDelete: events.onDelete,
      onInsert: events.onInsert,
      onReplace: events.onReplace,
    })

    this.cursorManager = new RemoteCursorManager({ editor, tooltipDuration: 2, tooltips: true })
    this.selectionManager = new RemoteSelectionManager({ editor })
  }

  public setCursorPosition(id: string, username: string, color: string, offset: number) {
    if (!(id in this.cursors))
      this.cursors[id] = this.cursorManager.addCursor(id, color, username)

    const cursor = this.cursors[id]
    cursor.setOffset(offset)
    cursor.show()
  }

  public hideCursor(id: string) {
    if (id in this.cursors)
      this.cursors[id].hide()
  }

  public removeCursor(id: string) {
    if (id in this.cursors)
      this.cursors[id].dispose()
  }

  public insertContent(index: number, text: string) {
    this.contentManager.insert(index, text)
  }

  public deleteContent(index: number, length: number) {
    this.contentManager.delete(index, length)
  }

  public replaceContent(index: number, length: number, text: string) {
    this.contentManager.replace(index, length, text)
  }

  public setSelection(id: string, color: string, startOffset: number, endOffset: number) {
    if (!(id in this.selections))
      this.selections[id] = this.selectionManager.addSelection(id, color)

    const selection = this.selections[id]
    selection.setOffsets(startOffset, endOffset)
    selection.show()
  }
}

// import { EditorContentManager, RemoteCursorManager, RemoteSelectionManager } from '@convergencelabs/monaco-collab-ext'
// import { RemoteCursor } from '@convergencelabs/monaco-collab-ext/typings/RemoteCursor'
// import { RemoteSelection } from '@convergencelabs/monaco-collab-ext/typings/RemoteSelection'

// export class MonacoCollaborationManager {
//   private editor: Editor.ICodeEditor
//   private contentManager: EditorContentManager
//   private cursorManager: RemoteCursorManager
//   private selectionManager: RemoteSelectionManager
//   private broadcast: (message: any) => void
//   private cursors: Record<string, RemoteCursor> = {}
//   private selections: Record<string, RemoteSelection> = {}
//   private id: string

//   constructor(editor: Editor.ICodeEditor, broadcast: (message: any) => void, id: string) {
//     this.editor = editor
//     this.broadcast = broadcast
//     this.id = id

//     this.editor.onDidChangeCursorPosition((e) => {
//       this.broadcast({
//         type: 'editor',
//         payload: {
//           id: this.id,
//           type: 'cursor',
//           line: e.position.lineNumber,
//           column: e.position.column,
//           offset: this.editor.getModel()?.getOffsetAt(e.position),
//         },
//       })
//     })

//     this.editor.onDidChangeCursorSelection((e) => {
//       this.broadcast({
//         type: 'editor',
//         payload: {
//           id: this.id,
//           type: 'selection',
//           startColumn: e.selection.startColumn,
//           startLine: e.selection.startLineNumber,
//           endColumn: e.selection.endColumn,
//           endLine: e.selection.endLineNumber,
//         },
//       })
//     })

//     this.contentManager = new EditorContentManager({
//       // @ts-ignore
//       editor: this.editor,
//       onDelete: (index, length) => {
//         this.onDeleteText(index, length)
//       },
//       onInsert: (index, text) => {
//         this.onInsertText(index, text)
//       },
//       onReplace: (index, length, text) => {
//         this.onReplaceText(index, length, text)
//       },
//     })
//     this.cursorManager = new RemoteCursorManager({
//       // @ts-ignore
//       editor: this.editor,
//       tooltips: true,
//       tooltipDuration: 2,
//     })
//     this.selectionManager = new RemoteSelectionManager({
//       // @ts-ignore
//       editor: this.editor,
//     })
//   }

//   private onDeleteText(index: number, length: number) {
//     console.log('Delete', index, length)
//     this.broadcast({
//       type: 'editor',
//       payload: {
//         id: this.id,
//         type: 'delete',
//         index,
//         length,
//       },
//     })
//   }

//   private onInsertText(index: number, text: string) {
//     console.log('Insert', index, text)
//     this.broadcast({
//       type: 'editor',
//       payload: {
//         id: this.id,
//         type: 'insert',
//         index,
//         text,
//       },
//     })
//   }

//   private onReplaceText(index: number, length: number, text: string) {
//     console.log('Replace', index, length, text)
//     this.broadcast({
//       type: 'editor',
//       payload: {
//         id: this.id,
//         type: 'replace',
//         index,
//         length,
//         text,
//       },
//     })
//   }

//   public handleEditorEvent(event: any, id: string, name: string) {
//     if (event.id === this.id) {
//       console.log(event)
//       if (event.type === 'cursor') {
//         if (!(id in this.cursors))
//           this.cursors[id] = this.cursorManager.addCursor(id, '#10b981', name)

//         const cursor = this.cursors[id]
//         cursor.setPosition({
//           column: event.column,
//           lineNumber: event.line,
//         })
//         cursor.show()
//       }

//       if (event.type === 'insert')
//         this.contentManager.insert(event.index, event.text)

//       if (event.type === 'delete')
//         this.contentManager.delete(event.index, event.length)

//       if (event.type === 'replace')
//         this.contentManager.replace(event.index, event.length, event.text)

//       if (event.type === 'selection') {
//         if (!(id in this.selections))
//           this.selections[id] = this.selectionManager.addSelection(id, '#10b981', name)

//         const selection = this.selections[id]

//         // this.editor.
//         selection.setPositions({
//           column: event.startColumn,
//           lineNumber: event.startLine,
//         }, {
//           column: event.endColumn,
//           lineNumber: event.endLine,
//         })
//         selection.show()
//       }
//     }
//   }
// }
