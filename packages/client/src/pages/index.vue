<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
</script>

<template>
  <div h="screen" p="4 l-0">
    <div overflow="hidden" h="full">
      <Splitpanes class="default-theme">
        <Pane>
          <EditorGroup />
        </Pane>
        <Pane>
          <PreviewGroup />
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>
