import { EditorPlugin } from './types'
import { WindiDecoration } from './windicss/decorations'
import { PackagesDecoration } from './packages'

export const editorPlugins: EditorPlugin[] = [
  WindiDecoration,
  PackagesDecoration,
]
