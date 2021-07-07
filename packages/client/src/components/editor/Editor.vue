<script setup lang="ts">
import { ref, defineProps, toRefs } from 'vue'
import { editor as Editor } from 'monaco-editor'
import { useMonaco } from '~/monaco/useMonaco'

const props = defineProps<{ model: Editor.ITextModel }>()
const { model } = toRefs(props)

const target = ref()
useMonaco(target, { model }, 'script')
</script>

<template>
  <div ref="target" class="h-full w-full"></div>
</template>
