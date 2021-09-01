import type { editor as Editor } from 'monaco-editor'
import { babelParse as parse } from '@vue/compiler-sfc'
import { getTokens } from '@wheatjs/sucrase'
import { Token } from '@wheatjs/sucrase/dist/parser/tokenizer'
import { formatTokenType } from '@wheatjs/sucrase/dist/parser/tokenizer/types'
import { EditorPlugin } from '../types'
import { useMonacoImport } from '~/monaco'
import { useStyleSheet } from '~/hooks/useStylesheet'
import { usePackages, onAddPackage, onRemovePackage } from '~/store'

interface State {
  decorations: string[]
  possiblePackages: {
    [key: string]: string
  }
}

const state: State = {
  decorations: [],
  possiblePackages: {},
}

const { rules } = useStyleSheet()

interface ImportDefinition {
  name: string
  start: number
  end: number
}

function collectImportsFromToken(code: string, tokens: Token[]) {
  const definedImports: ImportDefinition[] = []

  let isInImport = false
  let start = 0

  for (const token of tokens) {
    const type = formatTokenType(token.type)

    if (type === 'import') {
      isInImport = true
      start = token.start
    }
    else if (type === 'string' && isInImport) {
      isInImport = false

      definedImports.push({
        name: code.slice(token.start + 1, token.end - 1),
        start,
        end: token.end,
      })
    }
  }

  return definedImports
}

async function doDecorations(editor: Editor.IStandaloneCodeEditor) {
  const monaco = await useMonacoImport()

  if (!monaco || !parse)
    return

  const packages = usePackages()
  const installed = packages.packages.map(({ name }) => name)
  const decorations: Editor.IModelDecoration[] = []
  const text = editor.getValue()
  const tokens = getTokens(text, { transforms: [] })
  const imports = collectImportsFromToken(text, tokens)
  let i = 0
  state.possiblePackages = {}

  // const ast = parse(text, { sourceType: 'module', strictMode: false })

  rules.value = packages
    .packages
    .filter(({ version }) => version)
    .reduce((obj, item) => {
      const version = item.version?.replaceAll('.', '')

      return {
        ...obj,
        [`.package-version${version}::after`]: `content: 'v${item.version}';`,
      }
    }, {})

  for (const _import of imports) {
    if (!installed.includes(_import.name) && !_import.name.startsWith('.') && _import.name !== 'vue') {
      const model = editor.getModel()

      if (model) {
        const startPosition = model.getPositionAt(_import.start)
        const endPosition = model.getPositionAt(_import.end)

        state.possiblePackages[i] = _import.name

        if (startPosition && endPosition) {
          decorations.push({
            id: _import.start.toString(),
            ownerId: 0,
            range: new monaco.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
            options: {
              afterContentClassName: `editor-packages-install package-name-${i}`,
              hoverMessage: {
                value: `${_import.name} is not installed. \n\n Click to install package.`,
              },
            },
          })
        }

        i++
      }
    }

    if (installed.includes(_import.name) && !_import.name.startsWith('.') && _import.name !== 'vue') {
      const model = editor.getModel()

      if (model) {
        const startPosition = model.getPositionAt(_import.start)
        const endPosition = model.getPositionAt(_import.end)

        state.possiblePackages[i] = _import.name
        const version = packages.packages.find(({ name }) => name === _import.name)?.version

        if (startPosition && endPosition) {
          decorations.push({
            id: _import.start.toString(),
            ownerId: 0,
            range: new monaco.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
            options: {
              afterContentClassName: `editor-packages-version package-name-${i} package-version${version?.replaceAll('.', '')}`,
              hoverMessage: {
                value: `${_import.name} is using version ${version}. \n\n Click to change package version.`,
              },
            },
          })
        }

        i++
      }
    }
  }

  state.decorations = editor.deltaDecorations(state.decorations, decorations)
}

export const PackagesDecoration: EditorPlugin = {
  language: 'typescript',
  init(editor) {
    const pacakges = usePackages()

    editor.onMouseDown((e) => {
      if (e.target.element?.classList.contains('editor-packages-install')) {
        e.target.element.classList.forEach((value) => {
          if (value.includes('package-name')) {
            const name = state.possiblePackages[value.replace('package-name-', '')]

            if (name) {
              pacakges.addPackage(name)
                .then(() => doDecorations(editor))
            }
          }
        })
      }

      if (e.target.element?.classList.contains('editor-packages-version')) {
        e.target.element.classList.forEach((value) => {
          if (value.includes('package-name')) {
            const name = state.possiblePackages[value.replace('package-name-', '')]
            if (name)
              pacakges.openVersionDialog(name)
          }
        })
      }
    })

    onAddPackage(() => this.onContentChanged(editor))
    onRemovePackage(() => this.onContentChanged(editor))
  },
  onContentChanged(editor) {
    doDecorations(editor)
  },
}
