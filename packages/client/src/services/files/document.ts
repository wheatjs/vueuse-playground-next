import automerge from 'automerge'
import * as monaco from 'monaco-editor'

interface DocumentOptions {
  onUpdate?: () => void
  language?: string
}

export class Document {
  // We don't always want to react to changes from the model being updated
  // so we use this to ignore the update
  public name: string
  public model: monaco.editor.ITextModel
  public doc: any = automerge.from({ text: new automerge.Text() })
  private onUpdate: any

  private shouldIgnoreModelUpdate = false

  constructor(name: string, options: DocumentOptions) {
    this.name = name
    this.model = monaco.editor.createModel('', options.language)
    this.onUpdate = options.onUpdate

    this.model.onDidChangeContent((e) => {
      if (this.shouldIgnoreModelUpdate)
        return

      // When the model content is changed, we need to update the document
      let _change_doc = this.doc

      e.changes.forEach((change) => {
        _change_doc = automerge.change(_change_doc, (doc: { text: automerge.Text }) => {
          if (!doc.text)
            doc.text = new automerge.Text()

          if (change.text.length > 0) {
            doc.text.deleteAt!(change.rangeOffset, change.rangeLength)
            doc.text.insertAt!(change.rangeOffset, ...change.text)
          }
          else {
            doc.text.deleteAt!(change.rangeOffset, change.rangeLength)
          }
        })
      })

      // Now publish the changes in _change_doc
      const changes = automerge.getChanges(this.doc, _change_doc)
      this.doc = _change_doc // Assign the current doc to the changed doc.
      this.publishDocumentChanges(changes)
      this.publishUpdates()
    })
  }

  public publishDocumentChanges(changes: automerge.BinaryChange[]) {
    // TODO Publish changes from this
  }

  public onReceiveSyncMessage() {
    // React to changes
  }

  private publishUpdates() {
    if (this.onUpdate)
      this.onUpdate()
  }

  /**
   * Updates the monaco model from automerge patches
   *
   * This should run on any patch received from a peer
   */
  public updateModelFromPatch(patch: automerge.Patch) {
    this.shouldIgnoreModelUpdate = true

    if ('text' in patch.diffs.props) {
      Object.values(patch.diffs.props.text)
        .filter((e): e is automerge.ListDiff => e.type === 'text')
        .forEach(({ edits }) => {
          edits.forEach((edit) => {
            if (edit.action === 'insert') {
              // Insert a new character into the model
              const { lineNumber, column } = this.model.getPositionAt(edit.index)
              const text = edit.value.type === 'value' ? (edit.value.value as string) : ''
              this.model.applyEdits([
                {
                  text,
                  forceMoveMarkers: true,
                  range: new monaco.Range(lineNumber, column, lineNumber, column),
                },
              ])
            }
            else if (edit.action === 'multi-insert') {
              // Replace multiple characters into the model
              const { lineNumber, column } = this.model.getPositionAt(edit.index)
              this.model.applyEdits([
                {
                  text: edit.values.join(''),
                  forceMoveMarkers: true,
                  range: new monaco.Range(lineNumber, column, lineNumber, column),
                },
              ])
            }
            else if (edit.action === 'remove') {
              // Remove a character from the model
              const { lineNumber: startLine, column: startColumn } = this.model.getPositionAt(edit.index)
              const { lineNumber: endLine, column: endColumn } = this.model.getPositionAt(edit.index + edit.count)
              this.model.applyEdits([
                {
                  text: null,
                  forceMoveMarkers: true,
                  range: new monaco.Range(startLine, startColumn, endLine, endColumn),
                },
              ])
            }
            else if (edit.action === 'update') {
              // Update a character in the model
            }
          })
        })
    }

    this.shouldIgnoreModelUpdate = false
  }

  public get text(): string {
    return this.doc.text.toString()
  }
}
