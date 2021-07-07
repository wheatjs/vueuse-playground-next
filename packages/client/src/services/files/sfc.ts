import { Document } from './document'
import { BaseFile, FileOptions } from './base'

export class SFCFile extends BaseFile {
  public template: Document
  public script: Document
  public style: Document

  public compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  constructor(options: FileOptions) {
    super(options)

    this.template = new Document(`${this.filename}:template`, {
      onUpdate: () => this.onUpdate(),
      language: 'html',
    })
    this.script = new Document(`${this.filename}:script`, {
      onUpdate: () => this.onUpdate(),
      language: 'javascript',
    })
    this.style = new Document(`${this.filename}:style`, {
      onUpdate: () => this.onUpdate(),
      language: 'css',
    })
  }

  public override toString() {
    return `
      <script setup>${this.script.text}</script>
      <template>${this.template.text}</template>
      <style>${this.style.text}</style>
    `
  }
}
