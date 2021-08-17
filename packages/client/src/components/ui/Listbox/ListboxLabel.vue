<script setup lang="ts">
import { ListboxLabel } from '@headlessui/vue'
</script>

<template>
  <ListboxLabel>
    <div text="sm" font="bold">
      <slot />
    </div>
  </ListboxLabel>
</template>
