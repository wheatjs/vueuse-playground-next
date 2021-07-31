<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const close = async() => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    position="fixed bottom-8 left-0 right-0"
    flex="~ row"
    place="content-center"
    pointer="none"
  >
    <div
      pointer="auto"
      flex="~ row"
      space="x-4"
      p="2 l-4"
      items="center"
      border="1 dark-400 rounded"
      shadow="~ lg"
      bg="dark:dark-700"
      class="pwa-toast"
      role="alert"
    >
      <div text="dark:(light-900 opacity-70)">
        <span v-if="offlineReady">
          Playground is now ready to work offline!
        </span>
        <span v-else>
          New version available, click on reload button to update.
        </span>
      </div>
      <div flex="~ row" space="x-2" items="center">
        <Button small @click="close">
          Close
        </Button>
        <Button v-if="needRefresh" primary small @click="updateServiceWorker()">
          Reload
        </Button>
      </div>
    </div>
  </div>
</template>
