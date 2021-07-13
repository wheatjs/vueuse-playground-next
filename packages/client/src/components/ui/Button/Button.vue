<script setup lang="ts">
import { reactivePick } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to?: RouteLocationRaw
  href?: string
  icon?: boolean
  primary?: boolean
  small?: boolean
  large?: boolean
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
    transform="~ active:scale-90"
    border="rounded"
    transition="transform duration-75"
    font="antialiased sans medium"
    p="0"
    :class="{
      'h-8 px-2 text-sm': small,
      'h-12 px-4 text-xl': large,
      'h-10 px-4 text-base': !small && !large,
      'bg-green-400 hover:bg-green-300 focus-visible:bg-green-300': primary,
      'bg-light-600 hover:bg-light-900 focus-visible:bg-light-900 dark:(bg-dark-500 hover:bg-dark-900 focus-visible:bg-dark-900)': !primary
    }"
  >
    <div
      :class="{
        'text-green-900': primary,
        'text-dark-100 text-opacity-70 dark:text-light-900': !primary
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
