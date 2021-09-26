<script setup lang="ts">
import { useAuth, usePackages } from '~/store'

const auth = useAuth()
const packages = usePackages()

auth.init()
packages.addPackage('@vueuse/core') // Well since this is the vueuse playground, we will install vueuse by default
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
