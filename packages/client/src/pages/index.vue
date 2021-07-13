<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import { Hako } from 'vue-hako'
import * as monaco from 'monaco-editor'
import { fs, filesystem } from '~/store/files'
import { CssFile, JsonFile, SFCFile } from '~/services/files'
import ContainerTitle from '~/components/ui/ContainerTitle.vue'
import { ScriptFile } from '~/services/files/script'

const defaultScriptModel = monaco.editor.createModel('')
const defaultTemplateModel = monaco.editor.createModel('')
const defaultStyleModel = monaco.editor.createModel('')
const defaultJsonModel = monaco.editor.createModel('', 'json')

const scriptModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile && (currrentFile instanceof CssFile))
    return currrentFile.css.model

  if (currrentFile && currrentFile instanceof JsonFile)
    return currrentFile.json.model

  if (currrentFile && (currrentFile instanceof SFCFile || currrentFile instanceof ScriptFile) && currrentFile.script)
    return currrentFile.script.model

  return defaultScriptModel
})

const templateModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile && !(currrentFile instanceof SFCFile))
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

const type = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile instanceof CssFile)
    return 'sfc:style'

  if (currrentFile instanceof JsonFile)
    return 'json'

  if (currrentFile instanceof ScriptFile)
    return 'script'

  return 'sfc:script'
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
                      <ContainerTitle :type="type" />
                    </template>
                    <Editor :model="scriptModel" />
                  </Container>
                </Pane>
                <Pane v-if="templateModel ">
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
                    <Editor :model="defaultJsonModel" />
                  </Container>
                </Pane> -->
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
