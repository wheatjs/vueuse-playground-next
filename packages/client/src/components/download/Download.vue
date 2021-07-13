<script setup lang="ts">
import { useDownload } from '~/store'

const type = ref('files')
const download = useDownload()
</script>

<template>
  <Dialog v-slot="{ close }" v-model="download.isOpen" max-w="prose">
    <DialogTitle>
      <template #icon>
        <carbon-download />
      </template>
      Download Playground
      <template #subtitle>
        Outgorwn the playground? Take your project with you!
      </template>
    </DialogTitle>
    <RadioGroup v-model="type" space="y-4" p="4">
      <RadioGroupOption value="files">
        <template #icon>
          <vscode-icons-file-type-vue />
        </template>
        <template #label>
          Files Only
        </template>
        Download only the files you have created.
      </RadioGroupOption>
      <RadioGroupOption value="vite">
        <template #icon>
          <vscode-icons-file-type-vite />
        </template>
        <template #label>
          Vite Project
        </template>
        Download as a ready to go Vite project!
      </RadioGroupOption>
      <RadioGroupOption value="webpack">
        <template #icon>
          <logos-webpack />
        </template>
        <template #label>
          Webpack Project
        </template>
        Download as a webpack project!
      </RadioGroupOption>
    </RadioGroup>
    <DialogFooter>
      <Button @click="close()">
        Close
      </Button>
      <Button primary>
        <carbon-download />
        Download
      </Button>
    </DialogFooter>
  </Dialog>
</template>
