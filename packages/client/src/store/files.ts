import { createEventHook } from '@vueuse/core'
import { BaseFile, SFCFile } from '~/services/files'
import { compileFile } from '~/preview/compiler'
import { ScriptFile } from '~/services/files/script'

export interface FSFile {
  filename: string
  isProtected: boolean
  hide: boolean
  content: string
  compiled: any
}

export const SUPPORTED_EXTENSIONS = ['vue', 'css', 'json', 'js']

export const shouldUpdatePreviewHook = createEventHook<void>()

/**
 * Although we can't use reactivity directly on our virtual filesystem,
 * we can "proxy" our reactive object to make some things a little easier
 */
export const fs = reactive<{ files: FSFile[]; currentFilename: string; errors: (Error | string)[]; runtimeErrors: (Error | string)[]; filenames: string[] }>({
  files: [],
  currentFilename: '',
  errors: [],
  runtimeErrors: [],
  filenames: [],
})

/**
 * Represents a filesystem where we can create, update, and delete files.
 * This is more complicated than just having normal files as we would like to track
 * changes using automerge and edit our files via monaco.
 *
 * When trying to use Vue's reactivity system with this is caused some major problems with
 * circular references, so we can't use that here.
 *
 * We would like to support server different types of files. Each "file" can contain multiple documents,
 * each document having an automerge instance and a monaco model.
 */
class Filesystem {
  public files: Record<string, BaseFile | ScriptFile | SFCFile> = {
    'main.js': new ScriptFile({
      filename: 'main.js',
      isProtected: true,
      hide: true,
      onUpdate: filename => this.onUpdate(filename),
      initialScriptContent: `export default {
  /**
   * This function can be used to enhance the existing vue
   * app instance
   * 
   * @param {import('vue').App} app - The vue app instance.
   */
  enhanceApp(app) {
    
  },
}
`,
    }),
    'App.vue': new SFCFile({
      filename: 'App.vue',
      isProtected: true,
      onUpdate: filename => this.onUpdate(filename),
    }),
  }

  private currentFilename = 'App.vue'

  constructor() {
    this.onUpdate('App.vue')
  }

  private onUpdate(filename?: string) {
    // Compile the updated file
    if (filename) {
      const file = this.files[filename]

      if (file instanceof SFCFile)
        compileFile(file)

      setTimeout(() => shouldUpdatePreviewHook.trigger(), 0)
    }

    fs.currentFilename = this.currentFilename
    fs.files = Object.values(this.files).map(file => ({
      filename: file.filename,
      content: file.toString(),
      hide: file.hide,
      isProtected: file.isProtected,
      compiled: 'compiled' in file ? file.compiled : null,
    }))
  }

  public createFile(file: BaseFile) {
    file.onUpdate = () => this.onUpdate(file.filename)
    this.files[file.filename] = file
    this.onUpdate(file.filename)
    fs.filenames = Object.keys(this.files)
  }

  public deleteFile(filename: string) {
    const newIndex = fs.files.findIndex(x => x.filename === filename) - 1 || 0
    this.currentFilename = fs.files[newIndex].filename
    delete this.files[filename]
    this.onUpdate()
    fs.filenames = Object.keys(this.files)
  }

  public get currentFile(): BaseFile {
    return this.files[this.currentFilename]
  }

  public set currentFile(filename: string) {
    this.currentFilename = filename
    this.onUpdate()
  }
}

export const filesystem = new Filesystem()
export const shouldUpdatePreview = shouldUpdatePreviewHook.on
