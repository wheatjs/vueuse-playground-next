<script setup lang="ts">
import { useShare, useDownload, usePackages, useCollaboration } from '~/store'
import { toggleDark, isDark } from '~/hooks'

const share = useShare()
const download = useDownload()
const packages = usePackages()
const collaboration = useCollaboration()
</script>

<template>
  <nav
    h="full"
    w="full"
    space="y-2"
    flex="~ col"
    items="center"
    p="y-4"
  >
    <Logo w="12" m="b-2" />
    <IconButton v-tooltip.right="'VueUse Docs'" class="transform hover:rotate-8" href="https://vueuse.org/" target="_blank">
      <carbon-notebook />
    </IconButton>
    <IconButton v-tooltip.right="'Packages'" class="transform hover:-rotate-12" @click="packages.openDialog()">
      <carbon-box />
    </IconButton>
    <IconButton v-tooltip.right="'Share'" class="transform hover:rotate-10" @click="share.openDialog()">
      <carbon-share />
    </IconButton>
    <IconButton v-tooltip.right="'Download'" class="transform hover:-rotate-8" @click="download.openDialog()">
      <carbon-download />
    </IconButton>
    <IconButton v-tooltip.right="'Collaborate'" class="transform hover:-rotate-8" @click="collaboration.openDialog()">
      <carbon-connect />
    </IconButton>
    <span flex="1" />
    <IconButton v-tooltip.right="'Toggle Theme'" class="transform hover:rotate-12" @click="toggleDark()">
      <carbon-sun v-if="isDark" />
      <carbon-moon v-else />
    </IconButton>
    <IconButton v-tooltip.right="'Settings'" class="transform hover:-rotate-10">
      <carbon-settings />
    </IconButton>
  </nav>
</template>
