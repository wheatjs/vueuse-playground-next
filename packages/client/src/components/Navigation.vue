<script setup lang="ts">
import { useShare, useDownload, useCollaboration, useAuth } from '~/store'
import { toggleDark, isDark } from '~/hooks'

const share = useShare()
const download = useDownload()
const collaboration = useCollaboration()
const auth = useAuth()
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
    <IconButton class="transform hover:rotate-8" href="https://vueuse.org/" target="_blank">
      <carbon-notebook />
    </IconButton>
    <IconButton class="transform hover:rotate-10" @click="share.openDialog()">
      <carbon-share />
    </IconButton>
    <IconButton class="transform hover:-rotate-8" @click="download.openDialog()">
      <carbon-download />
    </IconButton>
    <IconButton
      class="transform hover:-rotate-8"
      :class="{ '!text-green-500 !text-opacity-20': collaboration.isConnected }"
      @click="collaboration.openDialog()"
    >
      <carbon-connect :class="{ '!text-green-400': collaboration.isConnected }" />
      <!-- Badge to indicate how many users are connected -->
      <div
        v-if="collaboration.isConnected"
        position="absolute top-0 right-0"
        text="xs green-900"
        font="bold"
        bg="green-500"
        w="5"
        h="5"
        m="-r-1 -t-1"
        rounded="full"
        flex="~"
        place="items-center content-center"
        ring="2 white dark:dark-900"
      >
        {{ collaboration.otherCollaborators.length }}
      </div>
    </IconButton>
    <span flex="1" />
    <IconButton class="transform hover:rotate-12" @click="toggleDark()">
      <carbon-sun v-if="isDark" />
      <carbon-moon v-else />
    </IconButton>
    <IconButton class="transform hover:-rotate-10" @click="auth.openDialog()">
      <carbon-login />
    </IconButton>
    <IconButton class="transform hover:-rotate-10">
      <carbon-settings />
    </IconButton>
  </nav>
</template>
