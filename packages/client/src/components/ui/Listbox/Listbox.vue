<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Listbox, ListboxOptions, ListboxButton } from '@headlessui/vue'
const props = defineProps<{ modelValue: string }>()
const value = useVModel(props)
</script>

<template>
  <Listbox v-model="value">
    <div position="relative">
      <ListboxButton
        v-bind="$attrs"
        text="xs"
        outline="focus:none"
        h="8"
        p="x-2"
        border="l-1 dark:dark-300"
        position="relative"
        display="block"
      >
        <div flex="~ row" items="center" space="x-1" w="full">
          <slot :value="value" />
          <span flex="1"></span>
          <carbon-chevron-down />
        </div>
      </ListboxButton>
      <ListboxOptions
        position="absolute top-5 right-0"
        bg="dark:dark-900 light-300"
        shadow="~ lg"
        border="rounded-b rounded-tl"
        overflow="hidden"
        list="none"
        outline="focus:none"
        p="0"
        z="5000"
      >
        <slot name="items" />
      </ListboxOptions>
    </div>
  </Listbox>
</template>
