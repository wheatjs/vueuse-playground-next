<script setup lang="ts">
type MessageType = 'error'

defineProps<{
  type: MessageType
}>()
</script>

<template>
  <div
    text="sm"
    font="mono"
    flex="~ row"
    items="center"
    :class="{
      'bg-red-500 bg-opacity-10 text-red-300': type === 'error'
    }"
    p="x-4 y-2"
    space="x-2"
  >
    <div
      :class="{
        'bg-red-500 bg-opacity-40 text-red-300': type === 'error'
      }"
      font="bold"
      text="uppercase"
      p="x-1"
      border="rounded"
    >
      {{ type }}
    </div>
    <span display="block" w="full" overflow="hidden" text="break-normal" class="break-words">
      <slot />
    </span>
  </div>
</template>
