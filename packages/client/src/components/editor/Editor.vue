<script setup lang="ts">
import type { SFCType } from '@playground/shared'
import { defineProps, defineEmit, ref, watch } from 'vue'
import { shouldUpdate, useCollaboration } from '~/store'
import { useMonaco } from '~/monaco/useMonaco'

const collaboration = useCollaboration()
const emit = defineEmit<(e: 'change', content: string) => void>()
const props = defineProps<{ language: string; value: string; type: SFCType }>()

const target = ref()
const { onChange, setContent } = useMonaco(target, {
  language: props.language,
  code: props.value,
}, props.type)

shouldUpdate(() => {
  collaboration.suppressContentEvent = true
  setTimeout(() => {
    setContent(props.value)
    setTimeout(() => {
      collaboration.suppressContentEvent = false
    }, 50)
  })
})

onChange(content => emit('change', content))
emit('change', props.value)
</script>

<template>
  <div ref="target" class="h-full w-full"></div>
</template>
