import { getCurrentInstance, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { createSingletonPromise } from '@antfu/utils'
// import types from '@vue/runtime-dom'
import { emmetHTML } from 'emmet-monaco-es'
import { usePackages } from '~/store'
/* __imports__ */

// import vueuseTypes from '@vueuse/core/index.d.ts?raw'
// import vueTypes from '@vue/runtime-core/dist/runtime-core.d.ts?raw'

const setup = createSingletonPromise(async() => {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    allowUnusedLabels: true,
    strict: false,
    allowJs: true,
  })

  const registeredPackages: string[] = []
  const packages = usePackages()

  watch(() => packages.packages, () => {
    packages.packages
      .filter(({ isResolving, types }) => !isResolving && types)
      .filter(({ name }) => !registeredPackages.includes(name))
      .forEach(({ name, types }) => {
        registeredPackages.push(name)
        monaco.languages.typescript.javascriptDefaults.addExtraLib(`declare module '${name}' { ${types} }`)
      })
  })

  await Promise.all([
    // load workers
    (async() => {
      const [
        { default: EditorWorker },
        { default: HtmlWorker },
        { default: TsWorker },
      ] = await Promise.all([
        import('monaco-editor/esm/vs/editor/editor.worker?worker'),
        import('./languages/html/html.worker?worker'),
        import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
      ])

      // @ts-expect-error
      window.MonacoEnvironment = {
        getWorker(_: any, label: string) {
          if (label === 'html' || label === 'handlebars' || label === 'razor')
            return new HtmlWorker()
          if (label === 'typescript' || label === 'javascript')
            return new TsWorker()
          return new EditorWorker()
        },
      }
    })(),
  ])

  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['>'],
    provideCompletionItems: (model, position) => {
      const codePre: string = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      const tag = codePre.match(/.*<(\w+)>$/)?.[1]

      if (!tag)
        return

      const word = model.getWordUntilPosition(position)

      return {
        suggestions: [
          {
            label: `</${tag}>`,
            kind: monaco.languages.CompletionItemKind.EnumMember,
            insertText: `</${tag}>`,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            },
          },
        ],
      }
    },
  })

  emmetHTML(monaco)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const injection_arg = monaco

  /* __async_injections__ */

  if (getCurrentInstance())
    await new Promise<void>(resolve => onMounted(resolve))

  return { monaco }
})

export default setup

// setup()
