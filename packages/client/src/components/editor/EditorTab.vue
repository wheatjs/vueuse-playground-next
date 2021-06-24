<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { playground, PROTECTED_FILES } from '~/store'

const props = defineProps<{ name: string }>()
const canDelete = computed(() => !PROTECTED_FILES.includes(props.name))
</script>

<template>
  <div
    p="l-2"
    h="8"
    text="sm"
    flex="~ row"
    items="center"
    cursor="pointer"
    :draggable="false"
    select="none"
    bg="dark:(dark-500) light-200"
    border="r-1 dark:(dark-300)"
    :class="{
      'pr-2': !canDelete
    }"
  >
    <vscode-icons-file-type-vue />
    <div m="l-2" text="dark:(light-900 opacity-70)">
      <slot />
    </div>
    <IconButton v-if="canDelete" mini>
      <carbon-close />
    </IconButton>
  </div>
</template>
