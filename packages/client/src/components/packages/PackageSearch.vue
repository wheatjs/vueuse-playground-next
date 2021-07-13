<script setup lang="ts">
import { useThrottle } from '@vueuse/core'
import PackageSearchResult from './PackageSearchResult.vue'
import { usePackages } from '~/store'

const query = ref('')
const throttledQuery = useThrottle(query, 250)
const packages = usePackages()

watch(throttledQuery, () => {
  packages.searchPackages(query.value)
})
</script>

<template>
  <div>
    <div>
      <Textfield v-model="query">
        <template #icon>
          <carbon-search />
        </template>
      </Textfield>
    </div>
    <div>
      <PackageSearchResult
        v-for="p in packages.results"
        :key="p.package?.name"
        :item="p"
      />
    </div>
  </div>
</template>
