<script setup lang="ts">
import type { SFCType } from '@playground/shared'
import { defineProps, defineEmit, ref, watch } from 'vue'
import { useMonaco } from '~/monaco/useMonaco'

const emit = defineEmit<(e: 'change', content: string) => void>()
const props = defineProps<{ language: string; value: string; type: SFCType }>()

const target = ref()
const { onChange, setContent } = useMonaco(target, {
  language: props.language,
  code: props.value,
}, props.type)

watch(() => props.value, () => setContent(props.value))
onChange(content => emit('change', content))
emit('change', props.value)
</script>

<template>
  <div ref="target" class="h-full w-full"></div>
</template>
