<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  center?: boolean
}>()
</script>

<template>
  <div p="4 t-0" flex="~" space="x-2" :class="center ? 'justify-center' : 'justify-end'">
    <div v-if="$slots.extra" flex="1">
      <slot name="extra" />
    </div>
    <slot />
  </div>
</template>
