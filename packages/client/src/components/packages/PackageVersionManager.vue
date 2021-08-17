<script setup lang="ts">
import GenericItem from '../ui/GenericItem.vue'
import { usePackages } from '~/store'

const version = ref()
const loading = ref(true)
const packages = usePackages()

watch(() => packages.currentPackageName, async() => {
  if (packages.currentPackageName) {
    loading.value = true
    await packages.resolveVersions(packages.currentPackageName)
    version.value = packages.currentPackage?.version
    loading.value = false
  }
})

watch(version, () => {
  if (packages.currentPackage && packages.currentPackage.version !== version.value) {
    packages.removePackage(packages.currentPackageName!)
    packages.addPackage(packages.currentPackageName!, version.value)
  }
})

const remove = () => {
  if (packages.currentPackageName) {
    packages.removePackage(packages.currentPackageName)
    packages.closeVersionDialog()
  }
}

</script>

<template>
  <Dialog v-slot="{ close }" v-model="packages.isVersionDialogOpen" max-w="prose">
    <div flex="~ col" h="full">
      <div bg="dark:dark-800" p="4">
        <GenericItem>
          <template #icon>
            <ph-package text="4xl dark:(light-50 opacity-50)" />
          </template>
          <template #title>
            Manage Package
          </template>
          <template #subtitle>
            {{ packages.currentPackageName }}
          </template>
          <IconButton @click="close()">
            <carbon-close />
          </IconButton>
        </GenericItem>
      </div>
      <div flex="1" overflow="auto">
        <div
          v-if="loading"
          grid="~"
          gap="4"
          place="content-center items-center"
          h="full"
          p="4"
        >
          <Spinner />
          <span text="lg dark:(light-900 opacity-50)">Loading Versions</span>
        </div>
        <div v-else p="4" space="y-4">
          <GenericItem>
            <template #title>
              Version
            </template>
            <template #subtitle>
              Select Package Version
            </template>
            <Select v-model="version">
              <template #icon>
                <ph-package text="base" />
              </template>
              <optgroup label="Tags">
                <Option
                  v-for="(_, tag) in packages.currentVersions?.tags"
                  :key="tag"
                  :value="tag"
                >
                  {{ tag }}
                </Option>
              </optgroup>
              <optgroup label="Versions">
                <Option
                  v-for="(version) in packages.currentVersions?.versions"
                  :key="version"
                  :value="version"
                >
                  {{ version }}
                </Option>
              </optgroup>
            </Select>
          </GenericItem>
          <GenericItem>
            <template #title>
              Remove Package
            </template>
            <template #subtitle>
              Remove package from project
            </template>
            <Button @click="remove()">
              <carbon-delete />
              Remove Package
            </Button>
          </GenericItem>
        </div>
      </div>
    </div>
  </Dialog>
</template>
