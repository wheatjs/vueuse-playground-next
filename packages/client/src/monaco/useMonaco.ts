import { watch, Ref, unref, ref } from 'vue'
import { until, createEventHook, tryOnUnmounted, MaybeRef } from '@vueuse/core'
import darkTheme from 'theme-vitesse/themes/vitesse-dark.json'
import lightTheme from 'theme-vitesse/themes/vitesse-light.json'
import type { editor as Editor, IDisposable } from 'monaco-editor'
import { SFCType } from '@playground/shared'
import { isDark } from '~/hooks'
import { editorPlugins } from '~/monaco/plugins/editor'
import { editors } from '~/store/editors'
import setupMonaco from '~/monaco'

export interface UseMonacoOptions {
  model: MaybeRef<Editor.ITextModel>
}

export function useMonaco(target: Ref, options: UseMonacoOptions, type: SFCType) {
  const changeEventHook = createEventHook<string>()
  const isSetup = ref(false)
  let editor: Editor.IStandaloneCodeEditor

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

      isSetup.value = true

      watch(isDark, () => {
        if (isDark.value)
          monaco.editor.setTheme('vitesse-dark')
        else
          monaco.editor.setTheme('vitesse-light')
      }, { immediate: true })

      let modelDisposables: IDisposable[] = []

      editor.onDidChangeModel(() => {
        modelDisposables.forEach(x => x.dispose())
        modelDisposables = []

        const model = editor.getModel()

        if (model) {
          const plugins = editorPlugins.filter(({ language }) => language === model.getModeId())

          plugins.forEach((p) => {
            if (p.init)
              p.init(editor)
          })
          modelDisposables.push(model.onDidChangeContent(() => {
            changeEventHook.trigger(editor.getValue())
            plugins.forEach(({ onContentChanged }) => onContentChanged(editor))
          }))
        }
      })

      editors.push({ type, editor })
    }, {
      flush: 'post',
      immediate: true,
    })
  }

  init()

  tryOnUnmounted(() => stop())

  return {
    onChange: changeEventHook.on,
  }
}
