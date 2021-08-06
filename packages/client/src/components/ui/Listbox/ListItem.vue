<script setup lang="ts">
import { ListboxOption } from '@headlessui/vue'
</script>

<template>
  <ListboxOption v-slot="{ active, selected }">
    <div
      :class="{ 'bg-light-900 dark:bg-dark-400': active || selected }"
      p="x-4 y-2"
      cursor="pointer"
      text="xs"
      bg="hover:(dark:dark-500 light-800)"
      class="whitespace-nowrap"
      flex="~"
      space="x-2"
      items="center"
    >
      <span flex="1">
        <slot />
      </span>
      <carbon-checkmark v-if="selected" />
    </div>
  </ListboxOption>
</template>
