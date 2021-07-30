<script setup lang="ts">
import { useMonaco } from '~/monaco/useMonaco'

const props = defineProps<{ model: any }>()
const { model } = toRefs(props)

const target = ref()
useMonaco(target, { model })
</script>

<template>
  <div ref="target" class="h-full w-full"></div>
</template>
