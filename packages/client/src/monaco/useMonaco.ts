import { watch, Ref, unref, ref } from 'vue'
import { until, createEventHook, tryOnUnmounted } from '@vueuse/core'
import darkTheme from 'theme-vitesse/themes/vitesse-dark.json'
import lightTheme from 'theme-vitesse/themes/vitesse-light.json'
import type { editor as Editor } from 'monaco-editor'
import { RemoteCursorManager } from '@convergencelabs/monaco-collab-ext'
import { isDark } from '~/hooks'
import { editorPlugins } from '~/monaco/plugins/editor'
import { useCollaboration } from '~/store'
import { editors } from '~/store/editors'
import setupMonaco from '~/monaco'

export function useMonaco(target: Ref, options: any) {
  const collaboration = useCollaboration()
  const changeEventHook = createEventHook<string>()
  const isSetup = ref(false)
  let editor: Editor.IStandaloneCodeEditor

  const setContent = async(content: string) => {
    await until(isSetup).toBeTruthy()
    if (editor)
      editor.setValue(content)
  }

  const init = async() => {
    const { monaco } = await setupMonaco()
    // @ts-expect-error
    monaco.editor.defineTheme('vitesse-dark', darkTheme)
    // @ts-expect-error
    monaco.editor.defineTheme('vitesse-light', lightTheme)

    watch(target, () => {
      const el = unref(target)

      if (!el)
        return

      const extension = () => {
        if (options.language === 'typescript')
          return 'ts'
        else if (options.language === 'javascript')
          return 'js'
        else if (options.language === 'html')
          return 'html'
      }

      const model = monaco.editor.createModel(options.code, options.language, monaco.Uri.parse(`file:///root/${Date.now()}.${extension()}`))
      editor = monaco.editor.create(el, {
        model,
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

      const plugins = editorPlugins.filter(({ language }) => language === options.language)

      plugins.forEach((p) => {
        if (p.init)
          p.init(editor)
      })

      editor.getModel()?.onDidChangeContent(() => {
        changeEventHook.trigger(editor.getValue())
        plugins.forEach(({ onContentChanged }) => onContentChanged(editor))
      })

      editors.push({
        type: options.language,
        editor,
      })
    }, {
      flush: 'post',
      immediate: true,
    })
  }

  init()

  tryOnUnmounted(() => stop())

  return {
    onChange: changeEventHook.on,
    setContent,
  }
}
