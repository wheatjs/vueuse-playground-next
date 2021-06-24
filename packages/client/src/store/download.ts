import { defineStore } from 'pinia'

export const useDownload = defineStore({
  id: 'download',
  state() {
    return {
      isOpen: false,
    }
  },
  actions: {
    openDialog() { this.isOpen = true },
    closeDialog() { this.isOpen = false },

    downloadFiles() {

    },

    downloadViteProject() {

    },

    downloadWebpackProject() {

    },
  },
})
