<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Dialog as HeadlessDialog, DialogOverlay, TransitionRoot } from '@headlessui/vue'

const props = defineProps<{ modelValue: boolean }>()
const isOpen = useVModel(props)

const close = () => isOpen.value = false
const open = () => isOpen.value = true
</script>

<template>
  <HeadlessDialog
    position="fixed inset-0"
    overflow="y-auto"
    z="10"
    :open="isOpen"
    @close="close()"
  >
    <div
      v-bind="null"
      position="relative"
      grid="~"
      place="items-center"
      min-h="screen"
      w="full"
      p="4"
    >
      <DialogOverlay
        position="fixed inset-0"
        backdrop="~ blur"
        bg="dark:(black opacity-20)"
      />
      <div
        v-motion
        :delay="0"
        :initial="{
          scale: 0.25,
          opacity: 0.5
        }"
        :enter="{
          scale: 1,
          opacity: 1,
        }"
        position="relative"
        border="rounded-md"
        overflow="auto"
        bg="light-100 dark:dark-700"
        shadow="lg"
        w="full"
        max-h="[70vh]"
        v-bind="$attrs"
      >
        <slot :close="close" />
      </div>
    </div>
  </HeadlessDialog>
</template>
