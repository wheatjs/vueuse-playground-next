<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { until, useClipboard } from '@vueuse/core'
import Presence from './Presence.vue'
import { useCollaboration } from '~/store'
import { CollaborationManager } from '~/store/collaboration/manager'

const room = useRouteQuery('room')
const manager = new CollaborationManager()
const collaboration = useCollaboration()
const clipboard = useClipboard()

const shareLink = ref('')

watch(room, () => {
  if (room.value && !collaboration.isConnected) {
    // To ensure the editors have been mounted
    // probably need to come up with a better solution
    setTimeout(() => {
      if (room.value)
        manager.connect(room.value.toString())
    }, 0)
  }
}, { immediate: true })

const connect = async() => {
  if (collaboration.isConnected)
    return

  manager.connect()

  await until(() => collaboration.session).not.toBeNull()
  room.value = collaboration.session
}

const disconnect = () => {
  if (collaboration.isConnected)
    manager.disconnect()

  room.value = undefined
}

watch(room, () => {
  shareLink.value = location.href
})
</script>

<template>
  <Dialog v-model="collaboration.isDialogOpen" max-w="prose">
    <DialogTitle>
      Collaborate
      <template #icon>
        <carbon-link />
      </template>
      <template #subtitle>
        Share this link to invite users to start collaborating!
      </template>
    </DialogTitle>
    <div p="4">
      <template v-if="collaboration.isConnected">
        <Textfield v-model="shareLink" select="all" auto-select read-only>
          <template #icon>
            <carbon-link />
          </template>
          <Button>
            <carbon-copy />
          </Button>
        </Textfield>

        <Presence></Presence>
      </template>
      <p v-else>
        Start a collaboration session and send a link to other people to invite them to your session. When your
        start a session, everyone who connects will automatically sync with your playground.
      </p>
    </div>
    <DialogFooter>
      <Button @click="collaboration.closeDialog()">
        Close
      </Button>
      <Button v-if="!collaboration.isConnected" primary @click="connect()">
        <carbon-play />
        Start Session
      </Button>
      <Button v-else primary @click="disconnect()">
        <carbon-stop />
        Leave Session
      </Button>
    </DialogFooter>
  </Dialog>
</template>
