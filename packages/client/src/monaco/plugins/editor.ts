import { EditorPlugin } from './types'
import { WindiDecoration } from './windicss/decorations'
import { PackagesDecoration } from './helpers'

export const editorPlugins: EditorPlugin[] = [
  WindiDecoration,
  PackagesDecoration,
]
