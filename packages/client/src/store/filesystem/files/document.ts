import automerge from 'automerge'
import { createEventHook, until } from '@vueuse/core'
import { loadWorkers, useMonacoImport } from '~/monaco'

interface DocumentOptions {
  onUpdate?: () => void
  language?: string
  initialContent?: string
}

export class Document {
  public name: string
  public model: monaco.editor.ITextModel
  public doc: any
  private onUpdate: any
  private onDocumentChangeHook = createEventHook<{ name: string; changes: Blob}>()
  private shouldIgnoreModelUpdate = false
  private language: string | undefined
  private hasModelLoaded = ref(false)

  public onDocumentChange = this.onDocumentChangeHook.on

  constructor(name: string, options: DocumentOptions) {
    this.name = name
    this.language = options.language
    this.doc = automerge.from({ text: new automerge.Text(options.initialContent) })
    this.onUpdate = options.onUpdate

    this.onDocumentChange = this.onDocumentChange.bind(this)
    this.onReceiveDocumentChanges = this.onReceiveDocumentChanges.bind(this)
    this.updateModelFromPatch = this.updateModelFromPatch.bind(this)
    this.import = this.import.bind(this)
    this.export = this.export.bind(this)

    useMonacoImport()
      .then((monaco) => {
        if (!monaco)
          return

        loadWorkers()
          .then(() => {
            this.model = monaco.editor.createModel(options.initialContent || '', options.language, monaco.Uri.parse(`file://${this.name}`))
            this.hasModelLoaded.value = true
            this.bindModel()
          })
      })
  }

  public bindModel() {
    this.model.onDidChangeContent((e) => {
      if (this.shouldIgnoreModelUpdate)
        return

      const _change_doc = automerge.change(this.doc, (_doc: { text: automerge.Text }) => {
        if (!_doc.text)
          _doc.text = new automerge.Text()

        for (const _change of e.changes) {
          if (_change.text.length > 0) {
            _doc.text.deleteAt!(_change.rangeOffset, _change.rangeLength)
            _doc.text.insertAt!(_change.rangeOffset, ..._change.text)
          }
          else {
            _doc.text.deleteAt!(_change.rangeOffset, _change.rangeLength)
          }
        }
      })

      const changes = automerge.getChanges(this.doc, _change_doc)
      this.doc = _change_doc // Assign the current doc to the changed doc.

      this.publishDocumentChanges(changes)
      this.publishUpdates()
    })
  }

  /**
   * Publishes changes from a document
   */
  public publishDocumentChanges(changes: automerge.BinaryChange[]) {
    // TODO Publish changes from this
    this.onDocumentChangeHook.trigger({ name: this.name, changes: new Blob(changes) })
  }

  /**
   * Called whenever a document recives changes
   */
  public async onReceiveDocumentChanges(changes: any) {
    changes = await new Response(changes).arrayBuffer()
    changes = new Uint8Array(changes)

    const documentChangeResult = automerge.applyChanges(this.doc, [changes])
    this.doc = documentChangeResult[0]
    const patches = documentChangeResult[1]
    this.updateModelFromPatch(patches)
    this.publishUpdates()
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
  public async updateModelFromPatch(patch: automerge.Patch) {
    this.shouldIgnoreModelUpdate = true
    const monaco = await useMonacoImport()

    if (!monaco)
      return

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

  public export() {
    return new Blob(automerge.getAllChanges(this.doc))
  }

  public async import(data: any) {
    data = await new Response(data).arrayBuffer()
    data = new Uint8Array(data)

    const doc = automerge.init()
    const x = automerge.applyChanges(doc, [data])
    this.doc = x[0]

    await until(this.hasModelLoaded).toBeTruthy()
    this.shouldIgnoreModelUpdate = true
    this.model.setValue(this.text)
    this.shouldIgnoreModelUpdate = false
  }
}
