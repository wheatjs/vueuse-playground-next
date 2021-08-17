<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{ modelValue: string }>()
const value = useVModel(props)
</script>

<template>
  <div
    flex="~ row"
    items="center"
    position="relative"
    bg="dark:(dark-900) light-600"
    border="rounded"
    cursor="pointer"
  >
    <div p="l-2" position="absolute" text="dark:(light-900 opacity-50)">
      <slot name="icon" />
    </div>
    <select
      v-model="value"
      outline="focus:none"
      ring="focus:(green-300 3 opacity-50)"
      border="rounded"
      p="l-9 r-10"
      h="10"
      bg="transparent"
      class="appearance-none"
      cursor="pointer"
    >
      <slot />
    </select>
    <carbon-chevron-down m="t-1" text="dark:(light-900 opacity-50)" position="absolute right-2" class="pointer-events-none" />
  </div>
</template>

<style>
  .dark select optgroup {
    @apply bg-dark-900 text-light-900 text-opacity-70 pt-4 block;
  }
</style>
