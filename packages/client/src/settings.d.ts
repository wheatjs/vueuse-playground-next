interface WindicssAttributify {
  disable: string[]
  prefix: string
  separator: string
}

interface WindicssTheme {
  extend: {
    screens: Record<string, string>
    colors: Record<string, any>
  }
}

export interface PlaygroundSettings {
  windicss: {
    eanbled: boolean
    attributify: boolean | WindicssAttributify
    theme: WindicssTheme
  }
}
