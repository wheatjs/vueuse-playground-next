import type { editor as Editor } from 'monaco-editor'
import { babelParse as parse } from '@vue/compiler-sfc'
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

async function doDecorations(editor: Editor.IStandaloneCodeEditor) {
  const monaco = await useMonacoImport()

  if (!monaco || !parse)
    return

  let i = 0
  const packages = usePackages()
  const installed = packages.packages.map(({ name }) => name)
  const text = editor.getValue()
  const ast = parse(text, { sourceType: 'module', strictMode: false })
  const decorations: Editor.IModelDecoration[] = []
  state.possiblePackages = {}

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

  if (ast.program.body) {
    for (const node of ast.program.body) {
      if (node.type === 'ImportDeclaration' && node.source.type === 'StringLiteral' && node.source.value.length > 0) {
        if (!installed.includes(node.source.value) && !(node.source.value as string).startsWith('.') && node.source.value !== 'vue') {
          const startPosition = editor.getModel()?.getPositionAt(node.start!)
          const endPosition = editor.getModel()?.getPositionAt(node.end!)

          state.possiblePackages[i] = node.source.value

          if (startPosition && endPosition) {
            decorations.push({
              id: node.start!,
              ownerId: 0,
              range: new monaco.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
              options: {
                afterContentClassName: `editor-packages-install package-name-${i}`,
                hoverMessage: {
                  value: `${node.source.value} is not installed. \n\n Click to install package.`,
                },
              },
            })
          }

          i++
        }

        if (installed.includes(node.source.value) && !(node.source.value as string).startsWith('.') && node.source.value !== 'vue') {
          const startPosition = editor.getModel()?.getPositionAt(node.start!)
          const endPosition = editor.getModel()?.getPositionAt(node.end!)

          state.possiblePackages[i] = node.source.value

          const version = packages.packages.find(({ name }) => name === node.source.value)?.version

          if (startPosition && endPosition) {
            decorations.push({
              id: node.start!,
              ownerId: 0,
              range: new monaco.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
              options: {
                afterContentClassName: `editor-packages-version package-name-${i} package-version${version?.replaceAll('.', '')}`,
                hoverMessage: {
                  value: `${node.source.value} is using version ${version}. \n\n Click to change package version.`,
                },
              },
            })
          }

          i++
        }
      }
    }
  }

  state.decorations = editor.deltaDecorations(state.decorations, decorations)
}

export const PackagesDecoration: EditorPlugin = {
  language: 'javascript',
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
