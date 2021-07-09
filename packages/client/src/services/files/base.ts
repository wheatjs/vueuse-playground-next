export interface FileOptions {
  filename: string
  hide?: boolean
  isProtected?: boolean
  onUpdate?: (filename: string) => void
}

/**
 *
 */
export class BaseFile {
  public filename: string
  public isProtected: boolean
  public hide: boolean
  protected _onUpdate: ((filename: string) => void) | undefined

  constructor(options: FileOptions) {
    this.filename = options.filename
    this.isProtected = options.isProtected || false
    this._onUpdate = options.onUpdate
    this.hide = options.hide || false
  }

  public get content() {
    return this.toString()
  }

  public onUpdate() {
    if (this._onUpdate)
      this._onUpdate(this.filename)
  }
}
