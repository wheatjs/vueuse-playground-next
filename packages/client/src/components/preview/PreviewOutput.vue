<script setup lang="ts">
import { fs } from '~/store/filesystem'
</script>

<template>
  <div>
    <PreviewMessage v-for="error in fs.errors" :key="error.toString()" type="error">
      {{ error.toString() }}
    </PreviewMessage>
    <PreviewMessage v-for="error in fs.runtimeErrors" :key="error.toString()" type="error">
      {{ error.toString() }}
    </PreviewMessage>
  </div>
</template>
