/**
 * Can't store monaco editor reference in store as
 * proxies cause issues
 */
import { SFCType } from '@playground/shared'
import { editor as Editor } from 'monaco-editor'

interface EditorReference {
  editor: Editor.IStandaloneCodeEditor
  type: SFCType
}

export const editors: EditorReference[] = []
