import { Document } from './document'
import { BaseFile, FileOptions } from './base'

export interface JsonFileOptions extends FileOptions {
  initialJsonContent?: string
}

export class JsonFile extends BaseFile {
  public json: Document
  public type = 'json'

  constructor(options: JsonFileOptions) {
    super(options)

    this.json = new Document(`${this.filename}:json`, {
      onUpdate: () => this.onUpdate(),
      language: 'json',
      initialContent: options.initialJsonContent,
    })
  }

  public exportDocuments() {
    return { json: this.json.export() }
  }

  public importDocuments(imports: any) {
    this.json.import(imports.json)
  }

  public override toString() {
    return this.json.text
  }

  public get compiled() {
    return {
      json: this.json.text,
      js: `export default ${JSON.parse(JSON.stringify(this.json.text))}`,
    }
  }
}
