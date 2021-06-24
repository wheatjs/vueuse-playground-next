// @ts-expect-error
import { parse } from 'acorn-loose'
import type { editor as Editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { EditorPlugin } from '../types'
import { usePackages } from '~/store'

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

function doDecorations(editor: Editor.IStandaloneCodeEditor) {
  let i = 0
  const packages = usePackages()
  const installed = packages.packages.map(({ name }) => name)
  const text = editor.getValue()
  const ast = parse(text)
  const decorations: Editor.IModelDecoration[] = []
  state.possiblePackages = {}

  if (ast.body) {
    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration' && node.source.type === 'Literal' && node.source.value !== '✖' && node.source.value.length > 0) {
        if (!installed.includes(node.source.value)) {
          const startPosition = editor.getModel()?.getPositionAt(node.start)
          const endPosition = editor.getModel()?.getPositionAt(node.end)

          state.possiblePackages[i] = node.source.value

          if (startPosition && endPosition) {
            decorations.push({
              id: node.start,
              ownerId: 0,
              range: new monaco.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
              options: {
                afterContentClassName: `editor-packages-install package-name-${i}'`,
                hoverMessage: {
                  value: `${node.source.value} is not installed. \n\n Click to install package.`,
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
    })
  },
  onContentChanged(editor) {
    doDecorations(editor)
  },
}
