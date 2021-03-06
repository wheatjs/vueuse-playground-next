import type { CompletionItem, TextDocument, HTMLDocument, Position } from 'vscode-html-languageservice'
import type { editor as Editor } from 'monaco-editor'

export interface HTMLPluginCompletion {
  position: Position
  document: TextDocument
  html: HTMLDocument
}

export interface HTMLPlugin {
  completions(options: HTMLPluginCompletion): CompletionItem[]
}

export interface EditorPlugin {
  language: string
  init?: (editor: Editor.IStandaloneCodeEditor) => void
  onContentChanged?: (editor: Editor.IStandaloneCodeEditor) => void
  action?: Editor.IActionDescriptor
  [key: string]: any
}
