import { RemoteCursorManager, RemoteSelectionManager } from '@convergencelabs/monaco-collab-ext'
import { RemoteCursor } from '@convergencelabs/monaco-collab-ext/typings/RemoteCursor'
import { RemoteSelection } from '@convergencelabs/monaco-collab-ext/typings/RemoteSelection'
import { editor as Editor, IDisposable } from 'monaco-editor'

export interface MonacoCollaborationManagerEvents {
  onSelect: (uri: string, startOffset: number, endOffset: number) => void
  onCursor: (uri: string, offset: number) => void
}

export class MonacoCollaborationManager {
  private editor: Editor.ICodeEditor
  private cursorManager: RemoteCursorManager
  private selectionManager: RemoteSelectionManager
  private cursors: Record<string, RemoteCursor> = {}
  private selections: Record<string, RemoteSelection> = {}
  private disposables: IDisposable[] = []

  constructor(editor: Editor.ICodeEditor, events: MonacoCollaborationManagerEvents) {
    this.editor = editor

    this.disposables.push(this.editor.onDidChangeCursorPosition((e) => {
      const model = this.editor.getModel()

      if (model) {
        const offset = model.getOffsetAt(e.position)
        events.onCursor(model.uri.toString(), offset)
      }
    }))

    this.disposables.push(this.editor.onDidChangeCursorSelection((e) => {
      const model = this.editor.getModel()

      if (model) {
        const startOffset = model.getOffsetAt(e.selection.getStartPosition())
        const endOffset = model.getOffsetAt(e.selection.getEndPosition())
        events.onSelect(model.uri.toString(), startOffset, endOffset)
      }
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

  public disconnect() {
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

  public get uri() {
    return this.editor.getModel()?.uri.toString()
  }
}
