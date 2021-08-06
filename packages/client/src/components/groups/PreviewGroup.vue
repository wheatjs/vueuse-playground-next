<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import { Hako } from 'vue-hako'
import { usePreview } from '~/store'

const preview = usePreview()

const enabled = computed(() => preview.size === 'Default')
const width = computed(() => preview.sizes[preview.size][0])
const height = computed(() => preview.sizes[preview.size][1])
</script>

<template>
  <Splitpanes horizontal>
    <Pane>
      <Container>
        <template #title>
          <ContainerTitle type="preview" />
        </template>
        <template #overflow>
          <UtilityButton small border="l-1 dark:dark-300" @click="preview.forceExecution()">
            <carbon-renew />
          </UtilityButton>
          <UtilityButton
            small
            border="l-1 dark:dark-300"
            @click="() => preview.isExecutionPaused ? preview.resumeExecution() : preview.pauseExecution()"
          >
            <carbon-play v-if="preview.isExecutionPaused" text="green-500" />
            <carbon-pause v-else text="red-400" />
          </UtilityButton>
          <Listbox v-model="preview.size">
            <template #default="{ value }">
              <carbon-devices />
              <span>
                {{ value }}
              </span>
            </template>
            <template #items>
              <ListItem v-for="(_, index) in preview.sizes" :key="index" :value="index">
                {{ index }}
              </ListItem>
            </template>
          </Listbox>
        </template>
        <Suspense>
          <Hako
            h="full"
            w="full"
            :width="width"
            :height="height"
            :disable-scaling="enabled"
          >
            <Preview bg="dark:dark-700 light-100" />
          </Hako>
        </Suspense>
      </Container>
    </Pane>
    <Pane size="25">
      <Container>
        <template #title>
          <ContainerTitle type="console" />
        </template>
        <div overflow="auto" w="full" h="full">
          <PreviewOutput />
        </div>
      </Container>
    </Pane>
  </Splitpanes>
</template>
