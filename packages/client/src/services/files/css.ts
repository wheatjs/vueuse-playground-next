import { Document } from './document'
import { BaseFile, FileOptions } from './base'

export interface CssFileOptions extends FileOptions {
  initialCssContent?: string
}

export class CssFile extends BaseFile {
  public css: Document

  constructor(options: CssFileOptions) {
    super(options)

    this.css = new Document(`${this.filename}:css`, {
      onUpdate: () => this.onUpdate(),
      language: 'css',
      initialContent: options.initialCssContent,
    })
  }

  public override toString() {
    return this.css.text
  }

  public get compiled() {
    return {
      json: this.css.text,
    }
  }
}
