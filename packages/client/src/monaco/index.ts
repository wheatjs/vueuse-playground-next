import { createSingletonPromise } from '@antfu/utils'
import { usePackages, fs } from '~/store'

/* __imports__ */

export const loadWorkers = createSingletonPromise(async() => {
  return await Promise.all([
    // load workers
    (async() => {
      const [
        { default: EditorWorker },
        { default: JsonWorker },
        { default: HtmlWorker },
        { default: TsWorker },
        { default: CssWorker },
      ] = await Promise.all([
        import('monaco-editor/esm/vs/editor/editor.worker?worker'),
        import('monaco-editor/esm/vs/language/json/json.worker?worker'),
        import('./languages/html/html.worker?worker'),
        import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
        import('monaco-editor/esm/vs/language/css/css.worker?worker'),
      ])

      // @ts-expect-error
      window.MonacoEnvironment = {
        getWorker(_: any, label: string) {
          if (label === 'json')
            return new JsonWorker()
          if (label === 'html' || label === 'handlebars' || label === 'razor')
            return new HtmlWorker()
          if (label === 'typescript' || label === 'javascript')
            return new TsWorker()
          if (label === 'css')
            return new CssWorker()

          return new EditorWorker()
        },
      }
    })(),
  ])
})

export const useMonacoImport = createSingletonPromise(async() => {
  if (typeof window !== 'undefined')
    return await import('monaco-editor')

  return null
})

const setup = createSingletonPromise(async() => {
  const monaco = await useMonacoImport()

  if (!monaco)
    return

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    moduleResolution: 2,
    allowUnusedLabels: true,
    strict: false,
    allowJs: true,
    importHelpers: true,
    noImplicitUseStrict: false,
  })

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    // Ignore unused variable warnings
    diagnosticCodesToIgnore: [6133, 6198],
  })

  const [
    { default: vueTypes },
    { default: vueSharedTypes },
    { default: vueRuntimeDomTypes },
    { default: vueRuntimeCoreTypes },
    { default: vueReactivityTypes },
    { default: localShims },
  ] = await Promise.all([
    import('vue/dist/vue.d.ts?raw'),
    import('@vue/shared/dist/shared.d.ts?raw'),
    import('@vue/runtime-dom/dist/runtime-dom.d.ts?raw'),
    import('@vue/runtime-core/dist/runtime-core.d.ts?raw'),
    import('@vue/reactivity/dist/reactivity.d.ts?raw'),
    import('../shims-vue.d.ts?raw'),
  ])

  const builtinLibs = [
    { content: `declare module '@vue/shared' { ${vueSharedTypes} }` },
    { content: `declare module '@vue/runtime-core' { ${vueRuntimeCoreTypes} }` },
    { content: `declare module '@vue/runtime-dom' { ${vueRuntimeDomTypes} }` },
    { content: `declare module '@vue/reactivity' { ${vueReactivityTypes} }` },
    { content: `declare module 'vue' { ${vueTypes} }` },
    { content: localShims },
  ]

  monaco.languages.typescript.javascriptDefaults.setExtraLibs([...builtinLibs])

  const packages = usePackages()

  const globalModules = ['vue-global-api']

  watch(() => [fs.filenames, packages.packages], () => {
    const _packages = packages.packages
      .filter(({ isResolving, types }) => !isResolving && types)
      .map(({ name, types }) => {
        if (globalModules.includes(name)) {
          return {
            content: types!,
          }
        }

        return {
          content: `declare module '${name}' { ${types} }`,
        }
      })

    const _files = fs.filenames
      .filter(filename => filename.endsWith('.vue'))
      .map((filename) => {
        return {
          content: `declare module './${filename}' {
          import { DefineComponent } from 'vue'
          const component: DefineComponent<{}, {}, any>
          export default component
        }`,
        }
      })

    monaco.languages.typescript.javascriptDefaults.setExtraLibs([
      ...builtinLibs,
      ..._packages,
      ..._files,
    ])
  }, { immediate: true })

  await loadWorkers()

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

  const { emmetHTML } = await import('emmet-monaco-es')
  emmetHTML(monaco)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const injection_arg = monaco

  /* __async_injections__ */

  if (getCurrentInstance())
    await new Promise<void>(resolve => onMounted(resolve))

  return { monaco }
})

export default setup

loadWorkers()

// setup()
