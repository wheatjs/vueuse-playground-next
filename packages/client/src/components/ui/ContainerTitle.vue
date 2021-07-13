<script setup lang="ts">
type TitleType = 'sfc:script' | 'sfc:template' | 'sfc:style' | 'script' | 'json' | 'preview' | 'console' | 'settings'

defineProps<{ type: TitleType }>()
</script>

<template>
  <template v-if="type === 'script'">
    <mdi-code-braces />
    <span>
      Script
    </span>
  </template>
  <template v-if="type === 'sfc:script'">
    <mdi-code-braces />
    <span>
      Script Setup
    </span>
  </template>
  <template v-if="type === 'sfc:template'">
    <mdi-code-tags />
    <span>
      Template
    </span>
  </template>
  <template v-if="type === 'sfc:style'">
    <mdi-language-css3 />
    <span>
      Style
    </span>
  </template>
  <template v-if="type === 'json'">
    <vscode-icons-file-type-json />
    <span>
      Json
    </span>
  </template>
  <template v-if="type === 'preview'">
    <mdi-eye />
    <span>
      Preview
    </span>
  </template>
  <template v-if="type === 'console'">
    <mdi-console />
    <span>
      Output
    </span>
  </template>
  <template v-if="type === 'settings'">
    <carbon-settings />
    <span>
      Settings
    </span>
  </template>
</template>
