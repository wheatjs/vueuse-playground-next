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

export const PROTECTED_FILES = ['App.vue']

export const playground: Files = reactive({
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

export function createFile(file: File) {
  playground.files[file.filename] = file
  compileFile(playground.files[file.filename])
}

export function deleteFile(filename: string) {
  delete playground.files[filename]
  setTimeout(() => openFile('App.vue'), 0)
}

export function deleteAllFiles() {
  playground.files = {}
}

export function openFile(filename: string) {
  playground.activeFilename = filename
}

interface ExportedFile {
  template: string
  script: string
  style: string
  filename: string
}

interface FileExports {
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

export const shouldUpdate = updateHook.on
