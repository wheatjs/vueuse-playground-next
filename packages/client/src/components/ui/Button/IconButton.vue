<script setup lang="ts">
import { reactivePick } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to?: RouteLocationRaw
  href?: string
  icon?: boolean
  primary?: boolean
  mini?: boolean
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
    bg="transparent"
    outline="focus:none"
    transform="~ active:scale-90"
    transition="transform duration-75"
    p="0"
    :class="{
      'w-6 h-6 text-sm': mini,
      'w-8 h-8 text-sm': small,
      'w-12 h-12 text-xl': large,
      'w-10 h-10 text-lg': !small && !large,
      'text-green-400 hover:text-green-300 focus-visible:text-green-300': primary,
      'text-light-600 hover:text-light-900 focus-visible:text-light-900 dark:(text-dark-500 hover:text-dark-700 focus-visible:text-dark-700)': !primary
    }"
  >
    <Squircle
      position="absolute inset-0"
      w="full"
      h="full"
    />
    <div
      :class="{
        'text-green-900': primary,
        'text-dark-100 text-opacity-70 dark:(text-light-900 text-opacity-70)': !primary
      }"
      w="full"
      h="full"
      flex="~"
      place="items-center content-center"
      position="relative"
    >
      <slot />
    </div>
  </component>
</template>
