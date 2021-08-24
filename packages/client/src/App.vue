<script setup lang="ts">
import { useAuth } from '~/store'

const auth = useAuth()
auth.init()
</script>

<template>
  <div position="fixed left-0 top-0 bottom-0" w="18">
    <Navigation />
  </div>
  <main h="full" m="l-18">
    <router-view />
  </main>
  <Auth />
  <Share />
  <Download />
  <Collaboration />
  <ReloadPrompt />
  <PackageVersionManager />
</template>
