<script setup lang="ts">
import type { WatchStopHandle } from 'vue'
import srcdoc from '~/preview/template.html?raw'
import { PreviewProxy } from '~/preview/PreviewProxy'
import { usePackages, fs as store, shouldUpdatePreview, usePreview } from '~/store'
import { isDark } from '~/hooks'

const { MAIN_FILE, vueRuntimeUrl, compileModulesForPreview, compileFile } = await import('~/preview/compiler')

const preview = usePreview()
const container = ref()
const runtimeError = ref()
const runtimeWarning = ref()

let sandbox: HTMLIFrameElement
let proxy: PreviewProxy
let stopUpdateWatcher: WatchStopHandle

const packages = usePackages()

watch([runtimeError, runtimeWarning], () => {
  store.runtimeErrors = [runtimeError.value, runtimeWarning.value].filter(x => x)
})

watch([isDark], () => updatePreview())

// create sandbox on mount
onMounted(createSandbox)
// reset sandbox when import map changes

watch(() => packages.importMap, (importMap, prev) => {
  if (!importMap) {
    if (prev) {
      // import-map.json deleted
      createSandbox()
    }
    return
  }
  try {
    const map = JSON.parse(importMap)
    if (!map.imports) {
      store.errors = [
        'import-map.json is missing "imports" field.',
      ]
      return
    }
    if (map.imports.vue) {
      store.errors = [
        'Select Vue versions using the top-right dropdown.\n'
        + 'Specifying it in the import map has no effect.',
      ]
    }
    createSandbox()
  }
  catch (e) {
    store.errors = [e]
  }
}, { deep: true })
// reset sandbox when version changes
watch([vueRuntimeUrl], createSandbox)
onUnmounted(() => {
  proxy.destroy()
  stopUpdateWatcher && stopUpdateWatcher()
})
function createSandbox() {
  if (sandbox) {
    proxy.destroy()
    if (stopUpdateWatcher)
      stopUpdateWatcher()
    container.value.removeChild(sandbox)
  }
  sandbox = document.createElement('iframe')
  sandbox.setAttribute('sandbox', [
    'allow-forms',
    'allow-modals',
    'allow-pointer-lock',
    'allow-popups',
    // enableSameOrigin.value ? 'allow-same-origin' : null,\
    'allow-same-origin',
    'allow-scripts',
    'allow-top-navigation-by-user-activation',
  ].join(' '))
  let importMap: Record<string, any>
  try {
    importMap = JSON.parse(packages.importMap || '{}')
  }
  catch (e) {
    store.errors = [`Syntax error in import-map.json: ${e.message}`]
    return
  }
  if (!importMap.imports)
    importMap.imports = {}

  importMap.imports.vue = vueRuntimeUrl.value
  const sandboxSrc = srcdoc.replace(/<!--IMPORT_MAP-->/, JSON.stringify(importMap))
  sandbox.srcdoc = sandboxSrc
  container.value.appendChild(sandbox)
  proxy = new PreviewProxy(sandbox, {
    on_fetch_progress: (progress: any) => {
      // pending_imports = progress;
    },
    on_error: (event: any) => {
      const msg = event.value instanceof Error ? event.value.message : event.value
      if (
        msg.includes('Failed to resolve module specifier')
        || msg.includes('Error resolving module specifier')
      ) {
        runtimeError.value = `${msg.replace(/\. Relative references must.*$/, '')
        }.\nYou may need to install this package to use it.`
      }
      else {
        runtimeError.value = event.value
      }
    },
    on_unhandled_rejection: (event: any) => {
      let error = event.value
      if (typeof error === 'string')
        error = { message: error }

      runtimeError.value = `Uncaught (in promise): ${error.message}`
    },
    on_console: (log: any) => {
      if (log.level === 'error') {
        if (log.args && log.args[0] instanceof Error)
          runtimeError.value = log.args[0].message
        else
          runtimeError.value = log.args[0]
      }
      else if (log.level === 'warn') {
        if (log.args && log.args[0].toString().includes('[Vue warn]')) {
          runtimeWarning.value = log.args
            .join('')
            .replace(/\[Vue warn\]:/, '')
            .trim()
        }
      }
    },
    on_console_group: (action: any) => {
      // group_logs(action.label, false);
    },
    on_console_group_end: () => {
      // ungroup_logs();
    },
    on_console_group_collapsed: (action: any) => {
      // group_logs(action.label, true);
    },
  })
  sandbox.addEventListener('load', () => {
    proxy.handle_links()
    ;({ off: stopUpdateWatcher } = shouldUpdatePreview(() => {
      updatePreview()
    }))
    updatePreview()
  })
}

async function updatePreview() {
  if (preview.isExecutionPaused)
    return

  // console.clear()
  runtimeError.value = null
  runtimeWarning.value = null
  try {
    const modules = compileModulesForPreview()
    // eslint-disable-next-line no-console
    console.log(`successfully compiled ${modules.length} modules.`)
    // reset modules
    await proxy.eval([
      'window.__modules__ = {};window.__css__ = \'\'',
      ...modules,
      isDark.value ? 'document.querySelector("html").classList.add("dark")' : 'document.querySelector("html").classList.remove("dark")',
      `
      import { createApp as _createApp } from "vue"
      if (window.__app__) {
        window.__app__.unmount()
        document.getElementById('app').innerHTML = ''
      }
      document.getElementById('__sfc-styles').innerHTML = window.__css__


      const app = window.__app__ = _createApp(__modules__["${MAIN_FILE}"].default)
      app.config.errorHandler = e => console.error(e)

      // App enhancements
      const mainFile = __modules__['main.js']

      if (mainFile && mainFile.default) {
        if (mainFile.default.enhanceApp) {
          mainFile.default.enhanceApp(app)
        }
      }

      // if (__APP_ENHANCE__ && __APP_ENHANCE__.enhanceApp) {
      //   __APP_ENHANCE__.enhanceApp(app)
      // }

      app.mount('#app')
      `.trim(),
    ])
  }
  catch (e) {
    runtimeError.value = e.message
  }
}
</script>

<template>
  <div position="relative" h="full">
    <div
      ref="container"
      w="full"
      h="full"
      flex="~"
      class="preview-container"
      place="items-center content-center"
    ></div>
    <!-- <div
      v-if="shouldDisplaySameOriginError"
      position="absolute inset-0"
      bg="dark-900"
      grid="~"
      place="items-center content-center"
      space="y-4"
    >
      <carbon-warning-alt w="16" h="16" text="yellow-500" />
      <div class="prose" text="center dark:(light-900 opacity-70)" font="medium">
        This playground needs access to localstorage, indexdb, and cookies on this domain. Make sure you trust this
        code before allowing access.
      </div>
      <div flex="~ row" space="x-2">
        <Button small>
          <ic-round-open-in-new />
          Learn More
        </Button>
        <Button small warn @click="enableSameOrigin = true">
          <carbon-checkmark />
          Allow
        </Button>
      </div>
    </div> -->
  </div>
</template>

<style>
.preview-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-container,
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
