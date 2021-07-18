<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import * as monaco from 'monaco-editor'
import { useElementBounding } from '@vueuse/core'
import { fs, filesystem, usePackages } from '~/store'
import { CssFile, JsonFile, SFCFile, ScriptFile } from '~/store/filesystem/files'

// To ensure that monaco loads all the wokers we need to define each langage
// in a model
const settingsModel = (filesystem.files['settings.json'] as JsonFile).json.model

const packages = usePackages()

const scriptModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (!currrentFile) return null
  if (currrentFile instanceof CssFile) return currrentFile.css.model
  if (currrentFile instanceof JsonFile) return currrentFile.json.model
  if (currrentFile instanceof ScriptFile) return currrentFile.script.model
  if (currrentFile instanceof SFCFile) return currrentFile.script.model
})

const templateModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (!currrentFile) return null
  if (currrentFile.filename === 'main.js') return settingsModel
  if (currrentFile instanceof SFCFile) return currrentFile.template.model
})

const styleModel = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (!currrentFile) return null
  if (currrentFile instanceof SFCFile && currrentFile.style) return currrentFile.style.model
})

const type = computed(() => {
  const currrentFile = filesystem.files[fs.currentFilename]

  if (currrentFile instanceof CssFile) return 'sfc:style'
  if (currrentFile instanceof JsonFile) return 'json'
  if (currrentFile instanceof ScriptFile) return 'script'

  return 'sfc:script'
})
</script>

<template>
  <div h="full">
    <EditorTabs />
    <div ref="target" class="calc-height">
      <Splitpanes horizontal>
        <Pane>
          <Container class="!rounded-t-none">
            <template #title>
              <ContainerTitle :type="type" />
              <span flex="1"></span>
              <template v-if="packages.isResolving">
                <span text="xs dark:light-900 dark:opacity-50">
                  Acquiring Types
                </span>
                <Spinner w="3" h="3" />
              </template>
            </template>
            <Editor :model="scriptModel" />
          </Container>
        </Pane>
        <Pane v-if="templateModel">
          <Container>
            <template #title>
              <ContainerTitle v-if="fs.currentFilename !== 'main.js'" type="sfc:template" />
              <ContainerTitle v-else type="settings" />
            </template>
            <Editor :model="templateModel" />
          </Container>
        </Pane>
      </splitpanes>
    </div>
  </div>
</template>

<style>
.calc-height { height: calc(100% - 2rem); }
</style>
