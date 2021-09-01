import { Document } from './document'
import { BaseFile, FileOptions } from './base'

export interface ScriptFileOptions extends FileOptions {
  initialScriptContent?: string
}

export class ScriptFile extends BaseFile {
  public script: Document
  public type = 'script'

  constructor(options: ScriptFileOptions) {
    super(options)

    this.script = new Document(`${this.filename}:script`, {
      onUpdate: () => this.onUpdate(),
      language: 'typescript',
      initialContent: options.initialScriptContent,
    })
  }

  public compiled = {
    js: '',
  }

  public override get documents() {
    return [this.script]
  }

  public override exportDocuments(asPlainText = false) {
    return { script: asPlainText ? this.script.text : this.script.export() }
  }

  public override importDocuments(imports: any) {
    this.script.import(imports.script)
  }

  public override toString() {
    return this.script.text
  }

  // public get compiled() {
  //   return {
  //     js: this.script.text,
  //   }
  // }
}
