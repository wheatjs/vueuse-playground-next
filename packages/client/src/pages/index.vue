<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
</script>

<template>
  <div h="screen" p="4 l-0">
    <div overflow="hidden" h="full">
      <Splitpanes class="default-theme">
        <Pane>
          <Suspense>
            <template #fallback>
              <div h="full">
                <div
                  position="relative"
                  border="1 light-900 dark:dark-400 rounded-t"
                  bg="dark:dark-500"
                  h="8"
                  flex="shrink-0"
                >
                </div>
                <div h="full" flex="~ col" space="y-3" class="calc-height">
                  <Container class="!rounded-t-none" />
                  <Container />
                </div>
              </div>
            </template>
            <template #default>
              <EditorGroup />
            </template>
          </Suspense>
        </Pane>
        <Pane>
          <PreviewGroup />
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>
