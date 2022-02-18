<script setup lang="ts">
import { useAuth } from '~/store'

const auth = useAuth()
const showSignIn = computed(() => !(auth.user && !auth.user.isAnonymous))
</script>

<template>
  <Dialog v-if="showSignIn" v-model="auth.isDialogOpen" max-w="prose">
    <DialogTitle>
      Sign In
      <template #icon>
        <carbon-logo-github />
      </template>
      <template #subtitle>
        Sign In to save and access your playgrounds!
      </template>
    </DialogTitle>
    <div p="4" class="prose" text="dark:(light-900 opacity-70)">
      Sign in with Github to save your playgrounds, easily access older playgrounds, and show-off your work
      on your profile!
    </div>
    <DialogFooter>
      <Button @click="auth.closeDialog()">
        Close
      </Button>
      <Button primary @click="auth.authenticateWithGithub()">
        <carbon-logo-github />
        Sign in with Github
      </Button>
    </DialogFooter>
  </Dialog>
  <Dialog v-else v-model="auth.isDialogOpen" max-w="prose">
    <DialogTitle>
      {{ auth.user?.displayName }}
      <template #icon>
        <img
          v-if="auth.user?.photoURL"
          border="rounded-full"
          w="12"
          h="12"
          :src="auth.user.photoURL"
          :alt="auth.user.displayName || ' '"
        >
        <carbon-user v-else />
      </template>
      <template #subtitle>
        {{ auth.user?.email }}
      </template>
    </DialogTitle>
    <div p="4" class="prose" text="dark:(light-900 opacity-70) center">
      More settings coming here soon! Please check back later!
    </div>
    <DialogFooter>
      <template #extra>
        <Button @click="auth.signOut()">
          Sign Out
        </Button>
      </template>
      <Button @click="auth.closeDialog()">
        Close
      </Button>
      <Button primary @click="auth.closeDialog()">
        Save
      </Button>
    </DialogFooter>
  </Dialog>
</template>
