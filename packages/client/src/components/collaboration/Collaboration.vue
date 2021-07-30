<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { useCollaboration } from '~/store'
import { CollaborationManager } from '~/store/collaboration/manager'

const route = useRoute()
const manager = new CollaborationManager()
const collaboration = useCollaboration()
const clipboard = useClipboard()

watch(() => [route.query], () => {
  if (route.query.room && !collaboration.isConnected) {
    // To ensure the editors have been mounted
    // probably need to come up with a better solution
    setTimeout(() => {
      if (route.query.room)
        manager.connect(route.query.room.toString())
    }, 0)
  }
}, { immediate: true })

const connect = () => {
  if (collaboration.isConnected)
    return

  manager.connect()
}

const disconnect = () => {
  if (collaboration.isConnected)
    manager.disconnect()
}
</script>

<template>
  <Dialog v-model="collaboration.isDialogOpen" max-w="prose">
    <DialogTitle>
      Collaborate {{ route.query }}
      <template #icon>
        <carbon-link />
      </template>
      <template #subtitle>
        Share this link to invite users to start collaborating!
      </template>
    </DialogTitle>
    <div p="4">
      <Textfield v-if="collaboration.isConnected" v-model="collaboration.shareLink" select="all" auto-select read-only>
        <template #icon>
          <carbon-link />
        </template>
        <Button>
          <carbon-copy />
        </Button>
      </Textfield>
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
        Stop Session
      </Button>
    </DialogFooter>
  </Dialog>
</template>
