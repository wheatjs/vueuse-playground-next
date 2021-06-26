<script setup lang="ts">
import { useCollaboration } from '~/store'

const collaboration = useCollaboration()
</script>

<template>
  <!-- <div
    v-for="collaborator in collaboration.others"
    :key="collaborator.id"
    v-motion
    v-tooltip.right="collaborator.name"
    :delay="0"
    :initial="{
      y: 100
    }"
    :enter="{
      y: 0
    }"
    h="6"
    w="6"
    border="rounded-full"
    bg="green-500"
    font="bold"
    text="green-900"
    flex="~"
    place="items-center content-center"
  >
    {{ collaborator.name[0] }}
  </div> -->
</template>
