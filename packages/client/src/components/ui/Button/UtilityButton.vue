<script setup lang="ts">
import { reactivePick } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to?: RouteLocationRaw
  href?: string
  icon?: boolean
  primary?: boolean
  warn?: boolean
}>()

const is = computed(() => props.to ? 'router-link' : props.href ? 'a' : 'button')
const computedProps = reactivePick(props, 'to', 'href')
</script>

<template>
  <component
    v-bind="computedProps"
    :is="is"
    position="relative"
    cursor="pointer"
    outline="focus:none"
    font="antialiased sans medium"
    bg="light-600 hover:light-900 active:dark-50 focus-visible:light-900 dark:(dark-500 !active:dark-900 hover:dark-700 focus-visible:dark-700)"
    p="x-2"
    h="full"
  >
    <div
      :class="{
        'text-green-900': primary,
        'text-yellow-900': warn,
        'text-dark-100 text-opacity-70 dark:text-light-900': !primary && !warn
      }"
      w="full"
      h="full"
      flex="~"
      gap="x-1"
      place="items-center content-center"
      position="relative"
    >
      <slot />
    </div>
  </component>
</template>
