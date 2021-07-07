<script setup lang="ts">
import { computed } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import { Hako } from 'vue-hako'
import * as monaco from 'monaco-editor'
import { fs, filesystem } from '~/store/files'
import { SFCFile } from '~/services/files'
import ContainerTitle from '~/components/ui/ContainerTitle.vue'

const defaultScriptModel = monaco.editor.createModel('')
const defaultTemplateModel = monaco.editor.createModel('')
const defaultStyleModel = monaco.editor.createModel('')

const scriptModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile && currrentFile instanceof SFCFile && currrentFile.script)
    return currrentFile.script.model

  return defaultScriptModel
})

const templateModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

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
  <div h="full" p="4 l-0">
    <Splitpanes class="default-theme">
      <Pane>
        <div h="full" flex="~ col">
          <EditorTabs />
          <Splitpanes horizontal>
            <Pane>
              <Container rounded="t-none">
                <template #title>
                  <ContainerTitle type="sfc:script" />
                </template>
                <Editor :model="scriptModel" />
              </Container>
            </Pane>
            <Pane>
              <Container>
                <template #title>
                  <ContainerTitle type="sfc:template" />
                </template>
                <Editor :model="templateModel" />
              </Container>
            </Pane>
            <!-- <Pane>
              <Container>
                <Editor :model="styleModel" />
              </Container>
            </Pane> -->
          </Splitpanes>
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
                <!-- <pre>{{ fs }}</pre> -->
              </div>
            </Container>
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </div>
</template>
