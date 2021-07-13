<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { RadioGroup as HeadlessRadioGroup } from '@headlessui/vue'

const props = defineProps<{ modelValue: string }>()
const value = useVModel(props)
</script>

<template>
  <HeadlessRadioGroup v-model="value">
    <slot />
  </HeadlessRadioGroup>
</template>
