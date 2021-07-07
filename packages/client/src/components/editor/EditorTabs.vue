<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Draggable from 'vuedraggable'
import { fs, filesystem } from '~/store'
import { SFCFile } from '~/services/files'
// import { playground, createFile, File, VALID_EXTENSIONS } from '~/store'

const target = ref<HTMLInputElement>()
const isAddingFile = ref(false)
const filename = ref('')

const isValidFile = computed(() => {
  if (filename.value in fs.files)
    return false

  return true
})

// const files = computed(() => {
//   return Object.values(fs.files)
// })

const doAddFile = () => {
  isAddingFile.value = true
  setTimeout(() => {
    if (target.value)
      target.value.focus()
  }, 0)
}

const addFile = (name: string) => {
  if (name.length > 0) {
    name = name.endsWith('.vue') ? name : `${name}.vue`
    filesystem.createFile(new SFCFile({ filename: name }))
    isAddingFile.value = false
    filename.value = ''

    filesystem.currentFile = name
  }
}

const onScroll = (e: WheelEvent) => {
  e.preventDefault()
  const target = (e.currentTarget as HTMLElement)
  target.scrollLeft += e.deltaY
}

onClickOutside(target, () => {
  isAddingFile.value = false
  addFile(filename.value)
  filename.value = ''
})
</script>

<template>
  <div
    position="relative"
    border="1 light-900 dark:(dark-400 b-dark-300) rounded-t"
    bg="dark:dark-500"
    h="8"
    flex="shrink-0"
  >
    <Draggable v-model="fs.files" :component-data="{ 'onWheel': onScroll, class: 'flex h-full overflow-x-auto overflow-y-hidden small-scrollbar' }" item-key="filename">
      <template #header>
        <EditorTab no-icon name="__APP__">
          <carbon-application />
        </EditorTab>
      </template>
      <template #item="{ element }">
        <EditorTab :name="element.filename" flex="inline">
          {{ element.filename }}
        </EditorTab>
      </template>
      <template #footer>
        <div h="full" flex="~" place="items-center">
          <EditorTab v-show="isAddingFile" name="__PROTECTED__">
            <template #icon>
              <vscode-icons-file-type-vue v-if="filename.endsWith('vue')" />
              <vscode-icons-file-type-json v-else-if="filename.endsWith('js')" />
              <vscode-icons-file-type-json v-else-if="filename.endsWith('json')" />
              <vscode-icons-file-type-css v-else-if="filename.endsWith('css')" />
              <vscode-icons-default-file v-else />
            </template>
            <input
              ref="target"
              v-model="filename"
              type="text"
              w="28"
              text="dark:(placeholder-light-900 placeholder-opacity-40)"
              bg="transparent"
              outline="focus:none"
              caret="green-500"
              placeholder="Component.vue"
              @keydown.enter="addFile(filename)"
            />
          </EditorTab>
          <IconButton mini @click="doAddFile()">
            <carbon-add />
          </IconButton>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<style>
  .small-scrollbar::-webkit-scrollbar {
    height: 4px;
  }
</style>
