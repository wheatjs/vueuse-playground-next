<script setup lang="ts">
import { defineProps } from 'vue'
import { usePackages } from '~/store'
import type { PackageSearchItem } from '~/services'

defineProps<{ item: Partial<PackageSearchItem> }>()

const packages = usePackages()
</script>

<template>
  <div v-if="item.package && item.package.name">
    {{ item.package?.name }}
    <Button @click="packages.addPackage(item.package.name)">
      Install
    </Button>
    Is Resolving: {{ packages.currentlyResolving.includes(item.package.name) }}
  </div>
</template>
