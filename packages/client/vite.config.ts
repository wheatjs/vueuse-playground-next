import path from 'path'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons, { ViteIconsResolver } from 'vite-plugin-icons'
import Components, { VueUseComponentsResolver } from 'vite-plugin-components'
import Windicss from 'vite-plugin-windicss'
import CopyVue from './plugins/copy-vue'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@vue/compiler-sfc': '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js',
    },
  },
  plugins: [
    Vue(),
    CopyVue(),
    Pages(),
    Icons(),
    Windicss(),
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
          htmlWorker: ['./src/monaco/languages/html/html.worker'],
          tsWorker: ['monaco-editor/esm/vs/language/typescript/ts.worker'],
          cssWorker: ['monaco-editor/esm/vs/language/css/css.worker'],
          jsonWorker: ['monaco-editor/esm/vs/language/json/json.worker'],
          editorWorker: ['monaco-editor/esm/vs/editor/editor.worker'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['consolidate', 'velocityjs', 'dustjs-linkedin', 'atpl', 'liquor', 'twig', 'ejs', 'eco', 'jazz', 'hamljs', 'hamlet', 'jqtpl', 'whiskers', 'haml-coffee', 'hogan.js', 'templayed', 'handlebars', 'underscore', 'lodash', 'walrus', 'mustache', 'just', 'ect', 'mote', 'toffee', 'dot', 'bracket-template', 'ractive', 'htmling', 'babel-core', 'plates', 'react-dom/server', 'react', 'vash', 'slm', 'marko', 'teacup/lib/express', 'coffee-script', 'squirrelly', 'twing'],
  },
})
