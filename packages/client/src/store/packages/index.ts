import { defineStore } from 'pinia'
import { createEventHook } from '@vueuse/core'
import { compare } from 'semver'
import { resolvePackage, resolvePackageVersions } from './resolver'
import { PacakgeVersions, PlaygroundPackage } from './types'

const addPackageHook = createEventHook<string>()
const removePackageHook = createEventHook<string>()

const CDN = import.meta.env.VITE_PACKAGE_CDN || 'https://unpkg.com/'
const url = (p: PlaygroundPackage) => `${CDN}${p.name}@${p.version}/${p.entry}`

export interface UsePackagesState {
  versions: Record<string, PacakgeVersions>
  packages: PlaygroundPackage[]
  isAcquiringTypes: boolean
  isVersionDialogOpen: boolean
  currentPackageName: string | null
}

export const usePackages = defineStore({
  id: 'packages',
  state() {
    return {
      versions: {},
      packages: [],
      isAcquiringTypes: false,
      isVersionDialogOpen: false,
      currentPackageName: null,
    } as UsePackagesState
  },
  getters: {
    importMap(): string {
      return `{ "imports": { ${this.packages.map(p => `"${p.name}": "${url(p)}"`).join(',\n')} } }`
    },
    currentVersions(state: UsePackagesState) {
      if (state.currentPackageName && state.currentPackageName in state.versions)
        return state.versions[state.currentPackageName]

      return null
    },
    currentPackage(state: UsePackagesState) {
      if (state.currentPackageName)
        return state.packages.find(({ name }) => name === state.currentPackageName)

      return null
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

      const pendingPackages = [
        ...this.packages,
        ...await resolvePackage(name, version),
      ]

      this.packages = pendingPackages.filter((_package, index) => {
        const shouldSkip = pendingPackages.some((p, _index) => {
          if (p.name === _package.name) {
            if (index !== _index)
              return compare(_package.version, p.version) < 0
          }

          return false
        })

        return !shouldSkip
      })

      this.packages = this.packages.filter((p, i) => this.packages.findIndex(({ name }) => name === p.name) === i)

      this.isAcquiringTypes = false
      addPackageHook.trigger(name)
    },

    /**
     * Removes the package from the dependencies
     *
     * @param name Package name
     */
    async removePackage(name: string) {
      this.packages = this.packages.filter(p => p.name !== name)
      removePackageHook.trigger(name)
    },

    async resolveVersions(name: string) {
      if (name in this.versions)
        return

      this.versions[name] = await resolvePackageVersions(name)
    },

    openVersionDialog(name: string) {
      this.currentPackageName = name
      setTimeout(() => {
        this.isVersionDialogOpen = true
      })
    },

    closeVersionDialog() {
      this.currentPackageName = null
      this.isVersionDialogOpen = false
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
