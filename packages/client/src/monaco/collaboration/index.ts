import { EditorContentManager, RemoteCursorManager, RemoteSelectionManager } from '@convergencelabs/monaco-collab-ext'
import { RemoteCursor } from '@convergencelabs/monaco-collab-ext/typings/RemoteCursor'
import { RemoteSelection } from '@convergencelabs/monaco-collab-ext/typings/RemoteSelection'
import { SFCType } from '@playground/shared'
import { editor as Editor, IDisposable } from 'monaco-editor'

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
  private disposables: IDisposable[] = []
  private type: SFCType

  constructor(editor: Editor.ICodeEditor, type: SFCType, events: MonacoCollaborationManagerEvents) {
    this.editor = editor
    this.type = type

    this.disposables.push(this.editor.onDidChangeCursorPosition((e) => {
      const model = this.editor.getModel()

      if (model) {
        const offset = model.getOffsetAt(e.position)
        events.onCursor(offset)
      }
    }))

    this.disposables.push(this.editor.onDidChangeCursorSelection((e) => {
      const model = this.editor.getModel()

      if (model) {
        const startOffset = model.getOffsetAt(e.selection.getStartPosition())
        const endOffset = model.getOffsetAt(e.selection.getEndPosition())
        events.onSelect(startOffset, endOffset)
      }
    }))

    this.disposables.push(this.contentManager = new EditorContentManager({
      editor,
      onDelete: events.onDelete,
      onInsert: events.onInsert,
      onReplace: events.onReplace,
    }))

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

  public showCursor(id: string) {
    if (id in this.cursors)
      this.cursors[id].show()
  }

  public removeCursor(id: string) {
    if (id in this.cursors) {
      this.cursors[id].dispose()
      delete this.cursors[id]
    }
  }

  public removeAllCursors() {
    Object.values(this.cursors).forEach(cursor => cursor.dispose())
    this.cursors = {}
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

  public disconnect() {
    this.contentManager.dispose()
    this.disposables.forEach(x => x.dispose())
  }

  public setSelection(id: string, color: string, startOffset: number, endOffset: number) {
    if (!(id in this.selections))
      this.selections[id] = this.selectionManager.addSelection(id, color)

    const selection = this.selections[id]
    selection.setOffsets(startOffset, endOffset)
    selection.show()
  }

  public removeSelection(id: string) {
    if (id in this.selections) {
      this.selections[id].dispose()
      delete this.selections[id]
    }
  }

  public removeAllSelections() {
    Object.values(this.selections).forEach(selection => selection.dispose())
    this.selections = {}
  }
}
