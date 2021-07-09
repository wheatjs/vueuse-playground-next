import { reactive } from 'vue'
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

// import { reactive, watchEffect } from 'vue'
// import { createEventHook } from '@vueuse/core'
// import { SFCFile } from '~/services/file'
// import { compileFile } from '~/preview/compiler'

// /**
//  * Would like to use pinia here, but it is a bit more complicated so will continue to use
//  * Vue's Reactive object
//  */

// // Some objects really don't like being reactive, so we will need to store them outside of vue's
// // reactivity system

// export class File {
//   filename: string
//   template: string
//   script: string
//   style: string

//   compiled = {
//     js: '',
//     css: '',
//     ssr: '',
//   }

//   constructor(filename: string, template: string | undefined, script: string | undefined, style?: string) {
//     this.filename = filename
//     this.template = template || ''
//     this.script = script || ''
//     this.style = style || ''
//   }

//   get code() {
//     return `
//     <script setup>
//     ${this.script}
//     </script>
//     <template>
//     ${this.template}
//     </template>
//     `
//   }
// }

// export { File }

// export interface Files {
//   files: Record<string, File>
//   activeFilename: string
//   errors: (Error | string)[]
//   runtimeErrors: (Error | string)[]
//   currentFile: File
// }

// const updateHook = createEventHook()
// const createFileHook = createEventHook<File>()
// const deleteFileHook = createEventHook<string>()

// export const VALID_EXTENSIONS = ['vue', 'css', 'json']
// export const PROTECTED_FILES = ['App.vue', '__APP__', '__PROTECTED__']

// export const playground: Files = reactive({
//   app: `
// export default {
//   enhanceApp({ app }) {

//   }
// }
//   `,
//   files: {
//     'App.vue': new File('App.vue'),
//   },
//   activeFilename: 'App.vue',
//   errors: [],
//   runtimeErrors: [],

//   get currentFile() {
//     return (this.files as any)[this.activeFilename] as File
//   },
// })

// export function createFile(file: File, silent = false) {
//   playground.files[file.filename] = file
//   compileFile(playground.files[file.filename])

//   if (!silent)
//     createFileHook.trigger(file)
// }

// export function deleteFile(filename: string, silent = false) {
//   delete playground.files[filename]
//   setTimeout(() => openFile('App.vue'), 0)

//   if (!silent)
//     deleteFileHook.trigger(filename)
// }

// export function deleteAllFiles() {
//   playground.files = {}
// }

// export function openFile(filename: string) {
//   playground.activeFilename = filename
//   setTimeout(() => {
//     updateHook.trigger(null)
//   }, 0)
// }

// interface ExportedFile {
//   template: string
//   script: string
//   style: string
//   filename: string
// }

// export interface FileExports {
//   activeFilename: string
//   files: ExportedFile[]
// }

// export function exportFiles() {
//   const files = Object.values(playground.files)
//     .map(({ template, script, style, filename }) => ({
//       template,
//       script,
//       style,
//       filename,
//     }))

//   return {
//     files,
//     activeFilename: playground.activeFilename,
//   }
// }

// export function importFiles({ files, activeFilename }: FileExports) {
//   deleteAllFiles()
//   files.forEach(({ filename, script, style, template }) => {
//     // createFile(new File(filename, template, script, style))
//     createFile(new File(filename))
//   })
//   setTimeout(() => {
//     playground.activeFilename = activeFilename
//   }, 0)
//   updateHook.trigger(null)
// }

// /**
//  * Setup file watchers to compile when opening a file
//  * or a file changes
//  */

// watchEffect(() => {
//   if (playground.currentFile)
//     compileFile(playground.currentFile)
// })

// export const onCreateFile = createFileHook.on
// export const onDeleteFile = deleteFileHook.on
// export const shouldUpdate = updateHook.on
