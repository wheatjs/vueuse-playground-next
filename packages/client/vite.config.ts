import path from 'path'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons, { ViteIconsResolver } from 'vite-plugin-icons'
import Components, { VueUseComponentsResolver } from 'vite-plugin-components'
import Windicss from 'vite-plugin-windicss'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'
import { VitePWA } from 'vite-plugin-pwa'
import CopyVue from './plugins/copy-vue'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js': '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js',
      '@vue/compiler-sfc': '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js',
    },
  },
  plugins: [
    Vue(),
    CopyVue(),
    Pages(),
    Icons(),
    Windicss(),
    PkgConfig(),
    OptimizationPersist(),
    VitePWA({
      mode: 'development',
      base: '/',
    }),
    Components({
      globalComponentsDeclaration: true,
      customComponentResolvers: [
        ViteIconsResolver({ componentPrefix: '' }),
        VueUseComponentsResolver(),
      ],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor', 'emmet-monaco-es'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['consolidate', 'velocityjs', 'dustjs-linkedin', 'atpl', 'liquor', 'twig', 'ejs', 'eco', 'jazz', 'hamljs', 'hamlet', 'jqtpl', 'whiskers', 'haml-coffee', 'hogan.js', 'templayed', 'handlebars', 'underscore', 'lodash', 'walrus', 'mustache', 'just', 'ect', 'mote', 'toffee', 'dot', 'bracket-template', 'ractive', 'htmling', 'babel-core', 'plates', 'react-dom/server', 'react', 'vash', 'slm', 'marko', 'teacup/lib/express', 'coffee-script', 'squirrelly', 'twing'],
  },
})
