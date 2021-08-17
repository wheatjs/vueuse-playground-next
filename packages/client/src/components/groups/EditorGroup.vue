<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import { fs, filesystem, usePackages } from '~/store'
import { CssFile, JsonFile, SFCFile, ScriptFile } from '~/store/filesystem/files'
import { loadWorkers, useMonacoImport } from '~/monaco'

await useMonacoImport()
await loadWorkers()

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
    <div class="calc-height">
      <Splitpanes horizontal>
        <Pane>
          <Container class="!rounded-t-none">
            <template #title>
              <ContainerTitle :type="type" />
              <span flex="1"></span>
              <template v-if="packages.isAcquiringTypes">
                <span text="xs dark:light-900 dark:opacity-50">
                  Acquiring Types
                </span>
                <Spinner w="3" h="3" />
              </template>
            </template>
            <Editor :model="scriptModel" />
          </Container>
        </Pane>
        <Pane v-if="templateModel || !scriptModel">
          <Container>
            <template #title>
              <ContainerTitle v-if="fs.currentFilename !== 'main.js'" type="sfc:template" />
              <ContainerTitle v-else type="settings" />
              <!-- <span flex="1" />
              <div space="x-1">
                <IconButton mini w="6">
                  <vscode-icons-file-type-html w="4" h="4" />
                </IconButton>
                <IconButton mini w="6">
                  <vscode-icons-file-type-css w="4" h="4" />
                </IconButton>
              </div> -->
            </template>
            <Editor :model="templateModel" />
          </Container>
        </Pane>
      </splitpanes>
    </div>
  </div>
</template>
