import { createEventHook } from '@vueuse/core'
import mainJsTemplate from './templates/main?raw'
import settingsTemplate from './templates/settings?raw'
import { BaseFile, JsonFile, SFCFile, CssFile } from '~/store/filesystem/files'
import { compileFile } from '~/preview/compiler'
import { ScriptFile } from '~/store/filesystem/files/script'

export interface FSFile {
  filename: string
  isProtected: boolean
  hide: boolean
  content: string
  compiled: any
}
export const SUPPORTED_EXTENSIONS = ['vue', 'css', 'json', 'js']

const shouldUpdatePreviewHook = createEventHook<void>()
const onFileCreatedHook = createEventHook<string>()
const onFileDeletedHook = createEventHook<string>()

interface FS {
  files: FSFile[]
  currentFilename: string
  errors: (Error | string)[]
  runtimeErrors: (Error | string)[]
  filenames: string[]
  settings: any
}

/**
 * Although we can't use reactivity directly on our virtual filesystem,
 * we can "proxy" our reactive object to make some things a little easier
 */
export const fs = reactive<FS>({
  files: [],
  currentFilename: '',
  errors: [],
  runtimeErrors: [],
  filenames: [],
  settings: {},
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
  public files: Record<string, BaseFile | ScriptFile | SFCFile | CssFile | JsonFile> = {
    'main.js': new ScriptFile({
      filename: 'main.js',
      isProtected: true,
      hide: true,
      onUpdate: filename => this.onUpdate(filename),
      initialScriptContent: mainJsTemplate,
    }),
    'App.vue': new SFCFile({
      filename: 'App.vue',
      isProtected: true,
      onUpdate: filename => this.onUpdate(filename),
    }),
    'settings.json': new JsonFile({
      filename: 'settings.json',
      isProtected: true,
      hide: true,
      initialJsonContent: settingsTemplate,
      onUpdate: () => this.onUpdate('App.vue'),
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

    try {
      fs.settings = JSON.parse(this.files['settings.json'].toString())
    }
    catch (error) {
      console.log('Invalid JSON format in settings.json')
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
    onFileCreatedHook.trigger(file.filename)

    return this.files[file.filename]
  }

  public deleteFile(filename: string) {
    const newIndex = fs.files.findIndex(x => x.filename === filename) - 1 || 0
    this.currentFilename = fs.files[newIndex].filename
    delete this.files[filename]
    this.onUpdate()
    fs.filenames = Object.keys(this.files)
    onFileDeletedHook.trigger(filename)
  }

  /**
   * Since each file can contain multiple documents, this methed will
   * return all the documents in each file type.
   */
  public get documents() {
    return Object.values(this.files).map(file => this.getDocumentsFromFile(file)).flat()
  }

  public getDocumentsFromFile(file: BaseFile) {
    if (file instanceof SFCFile) return [file.script, file.style, file.template]
    if (file instanceof ScriptFile) return [file.script]
    if (file instanceof CssFile) return [file.css]
    if (file instanceof JsonFile) return [file.json]

    return []
  }

  // @ts-ignore
  public get currentFile(): BaseFile {
    return this.files[this.currentFilename]
  }

  public set currentFile(filename: string) {
    this.currentFilename = filename
    this.onUpdate()
  }

  private exportFile(file: BaseFile) {
    return {
      filename: file.filename,
      type: file.type,
      hide: file.hide,
      isProtected: file.isProtected,
      documents: file.exportDocuments(),
    }
  }

  private importFile(file) {
    console.log(file)
    if (file.filename in this.files) {
      this.files[file.filename].importDocuments(file.documents)
      return
    }

    if (file.type === 'sfc') {
      // const f = this.createFile(new SFCFile({}))
      // this.files[file.name] = new SFCFile(file)
      // this.files[file.name].importDocuments(file.documents)
    }
    else if (file.type === 'script') {
      // this.files[file.name] = new ScriptFile(file)
      // this.files[file.name].importDocuments(file.documents)
    }
    else if (file.type === 'css') {
      // this.files[file.name] = new CssFile(file)
      // this.files[file.name].importDocuments(file.documents)
    }
    else if (file.type === 'json') {
      // this.files[file.name] = new JsonFile(file)
      // this.files[file.name].importDocuments(file.documents)
    }
  }

  public saveFiles() {
    return Object.values(this.files).map(file => this.exportFile(file))
  }

  public loadFiles(files: any[]) {
    files.forEach((file) => {
      this.importFile(file)
    })
  }
}

export const filesystem = new Filesystem()
export const shouldUpdatePreview = shouldUpdatePreviewHook.on

export const onFileCreated = onFileCreatedHook.on
export const onFileDeleted = onFileDeletedHook.on
