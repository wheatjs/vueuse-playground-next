<script setup lang="ts">
import { useShare } from '~/store'

const share = useShare()
const link = ref('')
</script>

<template>
  <Dialog v-slot="{ close }" v-model="share.isOpen" max-w="prose">
    <DialogTitle>
      <template #icon>
        <carbon-share />
      </template>
      Share Playground
      <template #subtitle>
        Share your creation for the world to see!
      </template>
    </DialogTitle>
    <div p="4">
      <Textfield v-model="link">
        <template #icon>
          <carbon-link />
        </template>
      </Textfield>
    </div>
    <DialogFooter>
      <template #extra>
        <Button>Want a shorter link?</Button>
      </template>
      <Button @click="close()">
        Close
      </Button>
      <Button primary>
        <carbon-share />
        Share
      </Button>
    </DialogFooter>
  </Dialog>
</template>
