import { defineStore } from 'pinia'
import { createEventHook } from '@vueuse/core'
import { resolvePackage } from './resolver'
import { PlaygroundPackage } from './types'

const addPackageHook = createEventHook<string>()
const removePackageHook = createEventHook<string>()

const CDN = import.meta.env.VITE_CDN || 'https://unpkg.com/'
const url = (p: PlaygroundPackage) => `${CDN}${p.name}@${p.version}/${p.entry}`

export interface UsePackagesState {
  packages: PlaygroundPackage[]
  isAcquiringTypes: boolean
}

export const usePackages = defineStore({
  id: 'packages',
  state() {
    return {
      packages: [],
      isAcquiringTypes: false,
    } as UsePackagesState
  },
  getters: {
    importMap(): string {
      return `{ "imports": { ${this.packages.map(p => url(p)).join(',\n')} } }`
    },
  },
  actions: {
    /**
     * Adds a new package as a dependency
     *
     * @param name Package name
     */
    async addPackage(name: string, version?: string) {
      this.isAcquiringTypes = true

      const packages = await resolvePackage(name, version)

      this.packages = [
        ...this.packages.filter(p => packages.findIndex(x => x.name === p.name)),
        ...packages,
      ]

      this.isAcquiringTypes = false
      addPackageHook.trigger(name)
    },

    /**
     * Removes the package from the dependencies
     *
     * @param name Package name
     */
    async removePackage(name: string) {
      removePackageHook.trigger(name)
    },
  },
})

/**
 * Whenever a package is added this funciton will be fired
 */
export const onAddPackage = addPackageHook.on

/**
 * Whenever a package is removed this function will be fired
 */
export const onRemovePackage = removePackageHook.on
