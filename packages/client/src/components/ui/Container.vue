<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">

</script>

<template>
  <div
    w="full"
    h="full"
    position="relative"
    bg="dark:dark-900 white"
  >
    <div
      v-bind="$attrs"
      p="l-2"
      h="8"
      bg="dark:dark-500 light-400"
      font="medium"
      space="x-2"
      text="sm dark:(light-900 opacity-70)"
      border="1 light-900 dark:dark-400 rounded-t b"
      flex="~ row shrink-0"
      items="center"
      position="realtive"
    >
      <div
        flex="~ row 1"
        items="center"
        space="x-2"
        h="full"
        bg="dark:dark-500 light-400"
      >
        <slot name="title" />
      </div>
      <div h="full" flex="~ row">
        <slot name="overflow" />
      </div>
    </div>
    <div
      class="calc-height"
      bg="light-500 dark:dark-800"
      border="1 light-900 dark:dark-400 rounded rounded-t-none t-0"
    >
      <slot />
    </div>
  </div>
</template>
