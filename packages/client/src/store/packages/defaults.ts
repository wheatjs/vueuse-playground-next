export interface PackageDefault {
  version?: string
  entry?: string
}

export const defaults: Record<string, PackageDefault> = {
  'vue-router': {
    version: 'next',
    entry: 'dist/vue-router.esm-browser.js',
  },

  'pinia': {
    version: 'next',
  },

  'vue-global-api': {
    version: '0.2.4',
  },
}

export function getDefault(name: string, version: string) {
  if (name in defaults) {
    const d = defaults[name]

    return {
      name,
      version: d.version,
      entry: d.entry,
    }
  }

  return {
    name,
    version,
    entry: null,
  }
}
