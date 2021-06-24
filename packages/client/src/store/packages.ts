import { defineStore } from 'pinia'
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

const JSDELIVR_URL = (name: string) => `https://cdn.jsdelivr.net/npm/${name}/+esm`
const UNPKG_URL = (name: string, url: string) => `https://unpkg.com/${name}/${url}`

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
            ${state.packages.map(({ name, url }) => `"${name}": "${UNPKG_URL(name, url!)}"`).join(',\n')}
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

      this.packages = [...this.packages, { isResolving: true, name }]
      const resolved = (await resolvePackage(name))

      this.packages = [
        // Filter out duplicates
        ...this.packages.filter(p => resolved.findIndex(x => x.name === p.name)),
        ...resolved.map(x => ({
          isResolving: false,
          ...x,
        })),
      ]
    },
    async searchPackages(query: string) {
      this.isLoading = true
      const { results } = await searchPackages(query)
      this.results = results
      this.isLoading = false
    },
  },
})
