<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'
import { useCollaboration } from '~/store'
// import { CollaborationManager } from '~/services/collaboration'

const route = useRoute()
// const manager = new CollaborationManager()
const collaboration = useCollaboration()

// manager.open()

// watch(() => [route.query, collaboration.isOpen], () => {
//   if (route.query.c && collaboration.isOpen)
//     manager.connect(route.query.c as string)
// })

const id = ref('')

const join = () => {
  let socket

  if (id.value.length > 0) {
    socket = io('http://localhost:4000', {
      query: {
        username: 'wheat',
        session: id.value,
      },
    })
  }
  else {
    socket = io('http://localhost:4000', {
      query: {
        username: 'wheat',
      },
    })
  }

  socket.connect()

  socket.on('room-connect', (session) => {
    console.log(session)
    // alert(session)
  })

  socket.on('users', (users) => {
    console.log(users)
  })
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
      <Textfield v-model="id" />
      <Textfield v-model="collaboration.shareLink" select="all" auto-select read-only>
        <template #icon>
          <carbon-link />
        </template>
        <Button v-tooltip="'Generate New URL'">
          <carbon-renew />
        </Button>
      </Textfield>
    </div>
    <DialogFooter>
      <Button @click="join()">
        Join
      </Button>
    </DialogFooter>
  </Dialog>
</template>
