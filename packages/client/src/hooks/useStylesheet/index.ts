import { ref, watch } from 'vue'

export interface StyleSheetRules {
  [key: string]: string
}

export function useStyleSheet(name: string) {
  const el: HTMLStyleElement = document.createElement('style')
  el.title = name
  document.body.appendChild(el)
  const rules = ref<Record<string, string>>({})
  const stylesheet: CSSStyleSheet | undefined = Object.values(document.styleSheets).find(({ title }) => title === name)

  watch(rules, (styles) => {
    if (!stylesheet)
      return

    for (let i = 0; i < stylesheet.rules.length; ++i)
      stylesheet.deleteRule(i)

    Object
      .keys(styles)
      .forEach(selector => stylesheet.insertRule(`${selector} { ${styles[selector]} }`))
  })

  return {
    rules,
  }
}
