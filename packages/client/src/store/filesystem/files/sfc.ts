import { Document } from './document'
import { BaseFile, FileOptions } from './base'

export interface SFCFileOptions extends FileOptions {
  initialScriptContent?: string
  initialTemplateContent?: string
  initialStyleContent?: string
}

export class SFCFile extends BaseFile {
  public template: Document
  public script: Document
  public style: Document
  public type = 'sfc'

  public compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  constructor(options: SFCFileOptions) {
    super(options)

    this.template = new Document(`${this.filename}:template`, {
      onUpdate: () => this.onUpdate(),
      language: 'html',
      initialContent: options.initialTemplateContent,
    })
    this.script = new Document(`${this.filename}:script`, {
      onUpdate: () => this.onUpdate(),
      language: 'javascript',
      initialContent: options.initialScriptContent,
    })
    this.style = new Document(`${this.filename}:style`, {
      onUpdate: () => this.onUpdate(),
      language: 'css',
      initialContent: options.initialStyleContent,
    })
  }

  public override get documents() {
    return [this.script, this.style, this.template]
  }

  public override exportDocuments() {
    return {
      template: this.template.export(),
      script: this.script.export(),
      style: this.style.export(),
    }
  }

  public override importDocuments(imports: any) {
    this.template.import(imports.template)
    this.script.import(imports.script)
    this.style.import(imports.style)
  }

  public override toString() {
    return `
      <script setup>${this.script.text}</script>
      <template>${this.template.text}</template>
      <style>${this.style.text}</style>
    `
  }
}
