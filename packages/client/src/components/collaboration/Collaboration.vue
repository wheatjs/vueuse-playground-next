<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCollaboration } from '~/store'
import { CollaborationManager } from '~/services/collaboration'

const route = useRoute()
const manager = new CollaborationManager()
const collaboration = useCollaboration()

const stop = watch(() => [route.query], () => {
  if (route.query.room && !collaboration.isConnected) {
    stop()
    setTimeout(() => {
      manager.connect(route.query.room.toString())
    }, 500)
  }
})

const connect = () => {
  if (collaboration.isConnected)
    return

  manager.connect()
}
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
      <Textfield v-if="collaboration.isConnected" v-model="collaboration.shareLink" select="all" auto-select read-only>
        <template #icon>
          <carbon-link />
        </template>
        <Button v-tooltip="'Generate New URL'">
          <carbon-renew />
        </Button>
      </Textfield>
      <p>
        Create a new session to connect to up to 4 other users.
      </p>
    </div>
    <DialogFooter>
      <Button @click="connect()">
        Create Session
      </Button>
    </DialogFooter>
  </Dialog>
</template>
