import { reactive, watchEffect } from 'vue'
import { createEventHook } from '@vueuse/core'
import { compileFile } from '~/preview/compiler'

/**
 * Would like to use pinia here, but it is a bit more complicated so will continue to use
 * Vue's Reactive object
 */

export class File {
  filename: string
  template: string
  script: string
  style: string

  compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  constructor(filename: string, template: string | undefined, script: string | undefined, style?: string) {
    this.filename = filename
    this.template = template || ''
    this.script = script || ''
    this.style = style || ''
  }

  get code() {
    return `
    <script setup>
    ${this.script}
    </script>
    <template>
    ${this.template}
    </template>
    `
  }
}

export interface Files {
  files: Record<string, File>
  activeFilename: string
  errors: (Error | string)[]
  runtimeErrors: (Error | string)[]
  currentFile: File
}

const updateHook = createEventHook()
const createFileHook = createEventHook<File>()
const deleteFileHook = createEventHook<string>()

export const VALID_EXTENSIONS = ['vue', 'css', 'json']
export const PROTECTED_FILES = ['App.vue', '__APP__', '__PROTECTED__']

export const playground: Files = reactive({
  app: `
export default {
  enhanceApp({ app }) {

  }
}
  `,
  files: {
    'App.vue': new File('App.vue', '', ''),
  },
  activeFilename: 'App.vue',
  errors: [],
  runtimeErrors: [],

  get currentFile() {
    return (this.files as any)[this.activeFilename] as File
  },
})

export function createFile(file: File, silent = false) {
  playground.files[file.filename] = file
  compileFile(playground.files[file.filename])

  if (!silent)
    createFileHook.trigger(file)
}

export function deleteFile(filename: string, silent = false) {
  delete playground.files[filename]
  setTimeout(() => openFile('App.vue'), 0)

  if (!silent)
    deleteFileHook.trigger(filename)
}

export function deleteAllFiles() {
  playground.files = {}
}

export function openFile(filename: string) {
  playground.activeFilename = filename
  setTimeout(() => {
    updateHook.trigger(null)
  }, 0)
}

interface ExportedFile {
  template: string
  script: string
  style: string
  filename: string
}

export interface FileExports {
  activeFilename: string
  files: ExportedFile[]
}

export function exportFiles() {
  const files = Object.values(playground.files)
    .map(({ template, script, style, filename }) => ({
      template,
      script,
      style,
      filename,
    }))

  return {
    files,
    activeFilename: playground.activeFilename,
  }
}

export function importFiles({ files, activeFilename }: FileExports) {
  deleteAllFiles()
  files.forEach(({ filename, script, style, template }) => {
    createFile(new File(filename, template, script, style))
  })
  setTimeout(() => {
    playground.activeFilename = activeFilename
  }, 0)
  updateHook.trigger(null)
}

/**
 * Setup file watchers to compile when opening a file
 * or a file changes
 */

watchEffect(() => {
  if (playground.currentFile)
    compileFile(playground.currentFile)
})

export const onCreateFile = createFileHook.on
export const onDeleteFile = deleteFileHook.on
export const shouldUpdate = updateHook.on
