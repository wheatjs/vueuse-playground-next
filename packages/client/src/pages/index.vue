<script setup lang="ts">
import { computed } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import { Hako } from 'vue-hako'
import * as monaco from 'monaco-editor'
import { fs, filesystem } from '~/store/files'
import { SFCFile } from '~/services/files'
import ContainerTitle from '~/components/ui/ContainerTitle.vue'
import { ScriptFile } from '~/services/files/script'

const defaultScriptModel = monaco.editor.createModel('')
const defaultTemplateModel = monaco.editor.createModel('')
const defaultStyleModel = monaco.editor.createModel('')

const scriptModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile && (currrentFile instanceof SFCFile || currrentFile instanceof ScriptFile) && currrentFile.script)
    return currrentFile.script.model

  return defaultScriptModel
})

const templateModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile && currrentFile instanceof ScriptFile)
    return null

  if (currrentFile && currrentFile instanceof SFCFile && currrentFile.template)
    return currrentFile.template.model

  return defaultTemplateModel
})

const styleModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile && currrentFile instanceof SFCFile && currrentFile.style)
    return currrentFile.style.model

  return defaultTemplateModel
})

</script>

<template>
  <div h="screen" p="4 l-0">
    <div overflow="hidden" h="full">
      <Splitpanes class="default-theme">
        <Pane>
          <div h="full">
            <EditorTabs />
            <div class="calc-height">
              <Splitpanes horizontal>
                <Pane>
                  <Container class="!rounded-t-none">
                    <template #title>
                      <ContainerTitle type="sfc:script" />
                    </template>
                    <Editor :model="scriptModel" />
                  </Container>
                </Pane>
                <Pane v-if="templateModel !== null && fs.currentFilename !== 'main.js'">
                  <Container>
                    <template #title>
                      <ContainerTitle v-if="fs.currentFilename !== 'main.js'" type="sfc:template" />
                      <ContainerTitle v-else type="settings" />
                    </template>
                    <Editor v-if="fs.currentFilename !== 'main.js'" :model="templateModel" />
                  </Container>
                </Pane>
                <!-- <Pane>
                  <Container>
                    <template #title>
                      <ContainerTitle type="sfc:style" />
                    </template>
                    <Editor :model="styleModel" />
                  </Container>
                </Pane> -->
              </Splitpanes>
            </div>
          </div>
        </Pane>
        <Pane>
          <Splitpanes horizontal>
            <Pane>
              <Container>
                <template #title>
                  <ContainerTitle type="preview" />
                </template>
                <Preview />
              </Container>
            </Pane>
            <Pane size="25">
              <Container>
                <template #title>
                  <ContainerTitle type="console" />
                </template>
                <div overflow="auto" w="full" h="full">
                  <pre>{{ fs.errors }}</pre>
                  <pre>{{ fs.runtimeErrors }}</pre>
                </div>
              </Container>
            </Pane>
          </Splitpanes>
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>

<style>
  .calc-height {
    height: calc(100% - 2rem);
  }
</style>
