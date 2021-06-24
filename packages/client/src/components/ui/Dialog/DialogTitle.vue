<script setup lang="ts">

</script>

<template>
  <div flex="~ row" space="x-2" items="center" p="4 b-0">
    <div text="3xl dark-50 opacity-70 dark:(light-900 opacity-50)">
      <slot name="icon" />
    </div>
    <div flex="1">
      <div text="l">
        <slot></slot>
      </div>
      <p text="sm dark-50 dark:(light-900 opacity-50)">
        <slot name="subtitle" />
      </p>
    </div>
  </div>
</template>
