import { defineStore } from 'pinia'

export const useShare = defineStore({
  id: 'share',
  state() {
    return {
      isOpen: false,
    }
  },
  actions: {
    openDialog() {
      this.isOpen = true
    },

    closeDialog() {
      this.isOpen = false
    },
  },
})
