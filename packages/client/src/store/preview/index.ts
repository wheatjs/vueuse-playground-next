import { defineStore } from 'pinia'
import { forceUpdatePreview } from '../filesystem'

export const usePreview = defineStore({
  id: 'preview',
  state() {
    return {
      size: 'Default',
      sizes: {
        'Default': [0, 0],
        'Moto 4G': [360, 640],
        'Galaxy S5': [360, 640],
        'Pixel 2': [411, 731],
        'Pixel 2 XL': [411, 823],
        'iPhone 5/SE': [320, 568],
        'iPhone 6/7/8': [375, 667],
        'iPhone 6/7/8 Plus': [414, 736],
        'iPhone X': [375, 812],
        'iPad': [768, 1024],
        'iPad Pro': [1024, 1366],
        'Surface Duo': [540, 720],
        'Galaxy Fold': [280, 653],
      },
      isExecutionPaused: false,
    }
  },
  actions: {
    forceExecution() {
      forceUpdatePreview()
    },
    resumeExecution() {
      this.isExecutionPaused = false
      this.forceExecution()
    },
    pauseExecution() {
      this.isExecutionPaused = true
    },
  },
})
