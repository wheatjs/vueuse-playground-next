import { defineStore } from 'pinia'
import { createEventHook } from '@vueuse/core'
import { searchPackages, PackageSearchItem } from '~/services'
import { resolvePackage } from '~/services/jsdelivr'

interface UsePackagePackage {
  isResolving: boolean
  name: string
  version?: string
  types?: string
  url?: string
}

interface UsePackagesState {
  isOpen: boolean
  isLoading: boolean
  packages: UsePackagePackage[]
  results: Partial<PackageSearchItem>[]
}

interface PackageOverride {
  version?: string
  file?: string
}

const PACKAGE_OVERRIDES: Record<string, PackageOverride> = {
  'vue-router': {
    version: 'next',
    file: 'dist/vue-router.esm-browser.js',
  },
  'pinia': {
    version: 'next',
  },
  'vuetify': {
    version: 'next',
  },
}

const UNPKG_URL = (name: string, url: string, version?: string) => `https://unpkg.com/${version ? `${name}@${version}` : name}/${url}`

const getPackageOverride = (name: string): PackageOverride => {
  if (name in PACKAGE_OVERRIDES)
    return PACKAGE_OVERRIDES[name]

  return {
    version: undefined,
    file: undefined,
  }
}

const addPackageHook = createEventHook<string>()
const removePackageHook = createEventHook<string>()

export const usePackages = defineStore({
  id: 'packages',
  state() {
    return {
      isOpen: false,
      isLoading: false,
      packages: [],
      results: [],
    } as UsePackagesState
  },
  getters: {
    currentlyResolving(state: UsePackagesState) { state.packages.filter(({ isResolving }) => isResolving).map(({ name }) => name) },
    importMap(state: UsePackagesState) {
      return `
        {
          "imports": {
            ${state.packages.map(({ name, url, version }) => `"${name}": "${UNPKG_URL(name, url!, version)}"`).join(',\n')}
          }
        }
      `
    },
  },
  actions: {
    openDialog() { this.isOpen = true },
    closeDialog() { this.isOpen = false },
    async addPackage(name: string) {
      // Check if package has already been added.
      if (this.packages.find(p => p.name === name))
        return

      const { version, file } = getPackageOverride(name)

      this.packages = [...this.packages, { isResolving: true, name }]
      const resolved = (await resolvePackage(name, version, file))

      this.packages = [
        // Filter out duplicates
        ...this.packages.filter(p => resolved.findIndex(x => x.name === p.name)),
        ...resolved.map(x => ({
          isResolving: false,
          ...x,
        })),
      ]
      addPackageHook.trigger(name)
    },
    async removePackage(query: string) {
      // TODO: Also remove any other dependencies
      this.packages = this.packages.filter(({ name }) => name !== query)
      removePackageHook.trigger(query)
    },
    async searchPackages(query: string) {
      this.isLoading = true
      const { results } = await searchPackages(query)
      this.results = results
      this.isLoading = false
    },
  },
})

export const onAddPackage = addPackageHook.on
export const onRemovePackage = removePackageHook.on
