import { defineStore } from 'pinia'
import { filesystem, fs } from '~/store/filesystem'
import { usePackages } from '~/store/packages'
import { useAuth } from '~/store/auth'

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string) || 'http://localhost:4000'

export const usePersistence = defineStore('persistence', {
  actions: {
    async save() {
      const auth = useAuth()
      const packages = usePackages()
      const files = filesystem.exportFiles(true)

      const token = await auth.user?.getIdToken()
      const exports = {
        client: auth.client,
        files,
        packages: packages.packages.map(p => ({ name: p.name, version: p.version })),
      }

      const response = await fetch(`${SERVER_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ exports }),
      })

      const data = await response.json()
    },

    load() {

    },

  },
})
