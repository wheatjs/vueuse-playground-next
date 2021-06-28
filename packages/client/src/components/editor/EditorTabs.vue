<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Muuri from 'muuri'
import IconButton from '../ui/Button/IconButton.vue'
import { playground } from '~/store'

let instance: Muuri
const target = ref()
const scrollTarget = ref()

onMounted(() => {
  if (target.value && scrollTarget.value) {
    instance = new Muuri(target.value, {
      layout: {
        horizontal: true,
      },
      dragStartPredicate: {
        distance: 10,
      },
      dragAutoScroll: {
        targets: [
          {
            element: scrollTarget.value,
            axis: Muuri.AutoScroller.AXIS_X,
          },
        ],
      },
      dragEnabled: true,
      dragAxis: 'x',
    })
  }
})

onUnmounted(() => {
  if (instance)
    instance.destroy()
})
</script>

<template>
  <div
    position="relative"
    border="1 light-900 dark:(dark-400 b-dark-300) rounded-t"
    bg="dark:dark-500"
  >
    <div
      ref="scrollTarget"
      position="relative"
      overflow="hidden"
      class="scroll-target"
      h="8"
      flex="shrink-0"
    >
      <div
        ref="target"
        class="grid relative"

        h="8"
      >
        <div v-for="file in playground.files" :key="file.filename" class="item absolute">
          <div class="item-content">
            <EditorTab :name="file.filename">
              {{ file.filename }}
            </EditorTab>
          </div>
        </div>
      </div>
    </div>
    <div
      gradient="to-r to-dark-500 from-transparent"
      pointer="none"
      position="absolute top-0 right-0"
      w="12"
      h="8"
      z="200"
      flex="~"
      items="center"
      justify="end"
    >
      <IconButton pointer="auto" mini text="dark:dark-300">
        <carbon-add />
      </IconButton>
    </div>
  </div>
</template>

<style>
  .muuri-item-dragging {
    @apply shadow-lg z-100;
  }

  .scroll-target::-webkit-scrollbar {
    height: 0 !important;
  }
</style>
