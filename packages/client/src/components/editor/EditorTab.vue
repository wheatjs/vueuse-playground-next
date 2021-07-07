<script setup lang="ts">
import { defineProps, computed } from 'vue'
// import { playground, PROTECTED_FILES, deleteFile, openFile } from '~/store'
import { filesystem, fs } from '~/store'

const props = defineProps<{ name: string; noIcon?: boolean; isProtected?: boolean }>()
const canDelete = computed(() => !fs.files.find(({ filename }) => filename === props.name)?.isProtected && !props.isProtected)
const isActive = computed(() => fs.currentFilename === props.name)

const setActive = () => filesystem.currentFile = props.name
const removeFile = () => filesystem.deleteFile(props.name)
</script>

<template>
  <div
    p="l-2"
    h="full"
    text="sm"
    flex="~ row"
    items="center"
    cursor="pointer"
    :draggable="false"
    select="none"
    bg="dark:(dark-500 hover:dark-300) light-200"
    border="r-1 dark:(dark-300)"
    :class="{
      'pr-2': !canDelete,
      '!dark:(bg-green-500 bg-opacity-10)': isActive
    }"
    @click="setActive"
  >
    <template v-if="!noIcon">
      <template v-if="$slots.icon">
        <slot name="icon" />
      </template>
      <vscode-icons-file-type-vue v-else-if="name.endsWith('vue')" />
      <vscode-icons-file-type-json v-else-if="name.endsWith('js')" />
      <vscode-icons-file-type-json v-else-if="name.endsWith('json')" />
      <vscode-icons-file-type-css v-else-if="name.endsWith('css')" />
      <vscode-icons-default-file v-else />
    </template>
    <div
      text="dark:(light-900 opacity-70)"
      :class="{
        'ml-2': !noIcon,
        'pr-1': !canDelete,
        '!dark:(text-green-300)': isActive
      }"
    >
      <slot />
    </div>
    <IconButton
      v-if="canDelete"
      mini
      :class="{
        '!dark:(text-green-100 text-opacity-0 hover:text-opacity-10)': isActive
      }"
      @click.stop="removeFile()"
    >
      <carbon-close
        :class="{
          'text-green-300': isActive
        }"
      />
    </IconButton>
  </div>
</template>
