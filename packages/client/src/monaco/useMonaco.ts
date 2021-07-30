import type { Ref } from 'vue'
import { until, createEventHook, tryOnScopeDispose, MaybeRef } from '@vueuse/core'
import darkTheme from 'theme-vitesse/themes/vitesse-dark.json'
import lightTheme from 'theme-vitesse/themes/vitesse-light.json'
import type { editor as Editor, IDisposable } from 'monaco-editor'
import { isDark } from '~/hooks'
import { editorPlugins } from '~/monaco/plugins/editor'
import { useEditors } from '~/store/collaboration/editors'
import setupMonaco from '~/monaco'

export interface UseMonacoOptions {
  model: MaybeRef<Editor.ITextModel>
}

const { addEditor } = useEditors()

export function useMonaco(target: Ref, options: UseMonacoOptions) {
  const changeEventHook = createEventHook<string>()
  const isSetup = ref(false)
  let editor: Editor.IStandaloneCodeEditor
  let disposeEditor: () => void

  watch(() => unref(options.model), async() => {
    await until(isSetup).toBeTruthy()

    if (editor)
      editor.setModel(unref(options.model))
  }, { immediate: true })

  const init = async() => {
    const { monaco } = await setupMonaco()
    monaco.editor.defineTheme('vitesse-dark', darkTheme as unknown as Editor.IStandaloneThemeData)
    monaco.editor.defineTheme('vitesse-light', lightTheme as unknown as Editor.IStandaloneThemeData)

    watch(target, () => {
      const el = unref(target)

      if (!el)
        return

      editor = monaco.editor.create(el, {
        tabSize: 2,
        insertSpaces: true,
        autoClosingQuotes: 'always',
        detectIndentation: false,
        folding: false,
        automaticLayout: true,
        theme: 'vitesse-dark',
        minimap: {
          enabled: false,
        },
      })

      disposeEditor = addEditor(editor)

      isSetup.value = true

      watch(isDark, () => isDark.value
        ? monaco.editor.setTheme('vitesse-dark')
        : monaco.editor.setTheme('vitesse-light')
      , { immediate: true })

      let modelDisposables: IDisposable[] = []

      editor.onDidChangeModel(() => {
        modelDisposables.forEach(x => x.dispose())
        modelDisposables = []

        const model = editor.getModel()

        if (!model)
          return

        const plugins = editorPlugins.filter(({ language }) => language === model.getModeId() || language === '*')

        plugins.forEach((p) => {
          if (p.init)
            p.init(editor)

          if (p.action && !editor.getAction(p.action.id))
            editor.addAction(p.action)
        })
        modelDisposables.push(model.onDidChangeContent(() => {
          changeEventHook.trigger(editor.getValue())
          plugins.forEach((plugin) => {
            if (plugin.onContentChanged)
              plugin.onContentChanged(editor)
          })
        }))
      })
    }, {
      flush: 'post',
      immediate: true,
    })
  }

  init()

  tryOnScopeDispose(() => {
    console.log('Destroying')
    stop()
    if (disposeEditor)
      disposeEditor()
  })

  return {
    onChange: changeEventHook.on,
  }
}
