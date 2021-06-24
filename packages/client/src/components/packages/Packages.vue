<script setup lang="ts">
import { usePackages } from '~/store'

const packages = usePackages()
</script>

<template>
  <Dialog v-slot="{ close }" v-model="packages.isOpen" max-w="screen-lg" h="full">
    <div p="4">
      <DialogTabs>
        <DialogTab name="Installed" active>
          {{ packages.packages.map(({ name }) => name) }}
        </DialogTab>
        <DialogTab name="Search">
          <PackageSearch />
        </DialogTab>
      </DialogTabs>
    </div>
  </Dialog>
</template>
