import { Document } from './document'
import { BaseFile, FileOptions } from './base'

export interface ScriptFileOptions extends FileOptions {
  initialScriptContent?: string
}

export class ScriptFile extends BaseFile {
  public script: Document

  constructor(options: ScriptFileOptions) {
    super(options)

    this.script = new Document(`${this.filename}:script`, {
      onUpdate: () => this.onUpdate(),
      language: 'javascript',
      initialContent: options.initialScriptContent,
    })
  }

  public override toString() {
    return this.script.text
  }

  public get compiled() {
    return {
      js: this.script.text,
    }
  }
}