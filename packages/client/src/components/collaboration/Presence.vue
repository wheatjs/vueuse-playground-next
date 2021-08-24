<script setup lang="ts">
import { useCollaboration } from '~/store'

const collaboration = useCollaboration()
</script>

<template>
  <div p="4" bg="dark:dark-800" border="1 dark:dark-900 rounded" m="t-4">
    <header flex="~ row" items="center" space="x-2">
      <carbon-user-multiple text="dark:(light-900 opacity-70)" />
      <span text="md dark:(light-900 opacity-90)">Collaborators</span>
    </header>
    <div>
      <div
        v-for="collaborator in collaboration.otherCollaborators"
        :key="collaborator.id"
        flex="~ row"
        items="center"
        space="x-2"
        p="y-2"
      >
        <img :src="collaborator.avatar" w="8" h="8" rounded="full" />
        <span text="lg">
          {{ collaborator.username }}
        </span>
      </div>
    </div>
  </div>
</template>
