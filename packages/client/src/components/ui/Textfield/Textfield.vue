<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const target = ref<HTMLInputElement>()
const props = defineProps<{
  modelValue: any
  disabled?: boolean
  readOnly?: boolean
  autoSelect?: boolean
}>()
const value = useVModel(props)

const onFocus = () => {
  if (target.value && props.autoSelect)
    target.value.select()
}
</script>

<template>
  <div flex="~" bg="dark:dark-400" border="~ 1 rounded dark:dark-900" h="10" overflow="hidden">
    <div
      v-if="$slots.icon"
      h="full"
      w="12"
      flex="~"
      place="items-center content-center"
      bg="dark:dark-600"
      border="r-1 dark:dark-900"
    >
      <slot name="icon" />
    </div>
    <input
      ref="target"
      v-model="value"
      flex="1"
      p="x-4"
      bg="transparent"
      type="text"
      text="dark:(light-900 opacity-50)"
      outline="focus:none"
      :disabled="disabled"
      :readonly="readOnly"
      @focus="onFocus"
    >
    <div
      v-if="$slots.default"
      h="full"
      flex="~"
      place="items-center content-center"
      bg="dark:dark-600"
      border="l-1 dark:dark-900"
    >
      <slot />
    </div>
  </div>
</template>
