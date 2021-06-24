<script setup lang="ts">

</script>

<template>
  <div flex="~ col" w="full" h="full" bg="light-500 dark:dark-800" border="1 light-900 dark:dark-400 rounded">
    <div
      p="x-2"
      h="8"
      bg="dark:dark-500"
      font="medium"
      space="x-2"
      text="sm dark:(light-900 opacity-70)"
      border="b-1 light-900 dark:dark-400"
      flex="~ row shrink-0"
      items="center"
    >
      <div flex="~ row 1" items="center" space="x-2" h="full" m="t-[2px]">
        <slot name="title" />
      </div>
      <slot name="overflow" />
    </div>
    <div flex="1" overflow="hidden">
      <slot />
    </div>
  </div>
</template>
