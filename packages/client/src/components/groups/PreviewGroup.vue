<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import { usePreview } from '~/store'

const preview = usePreview()
const enabled = computed(() => preview.size === 'Default')
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
            <carbon-renew text="cyan-500" />
          </UtilityButton>
          <UtilityButton
            small
            border="l-1 dark:dark-300"
            @click="() => preview.isExecutionPaused ? preview.resumeExecution() : preview.pauseExecution()"
          >
            <carbon-play v-if="preview.isExecutionPaused" text="green-500" />
            <carbon-pause v-else text="red-400" />
          </UtilityButton>
          <UtilityButton
            v-if="preview.size !== 'Default'"
            small
            border="l-1 dark:dark-300"
            @click="() => preview.landscape = !preview.landscape"
          >
            <mdi-phone-rotate-landscape v-if="!preview.landscape" text="dark:(light-900 opacity-50)" />
            <mdi-phone-rotate-portrait v-else text="dark:(light-900 opacity-50)" />
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
            :width="preview.resolution.width"
            :height="preview.resolution.height"
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
