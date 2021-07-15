<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import { Hako } from 'vue-hako'
import * as monaco from 'monaco-editor'
import { fs, filesystem, usePackages } from '~/store'
import { CssFile, JsonFile, SFCFile, ScriptFile } from '~/store/filesystem/files'
import ContainerTitle from '~/components/ui/ContainerTitle.vue'
import PreviewErrors from '~/components/preview/PreviewOutput.vue'

// To ensure that monaco loads all the wokers we need to define each langage
// in a model
const defaultScriptModel = monaco.editor.createModel('', 'js')
const defaultTemplateModel = monaco.editor.createModel('', 'html')
const defaultStyleModel = monaco.editor.createModel('', 'css')
const defaultJsonModel = monaco.editor.createModel('', 'json')

const settingsModel = (filesystem.files['settings.js'] as ScriptFile).script.model

const packages = usePackages()

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

  if (currrentFile.filename === 'main.js')
    return settingsModel

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
                <Pane v-if="templateModel ">
                  <Container>
                    <template #title>
                      <ContainerTitle v-if="fs.currentFilename !== 'main.js'" type="sfc:template" />
                      <ContainerTitle v-else type="settings" />
                    </template>
                    <Editor :model="templateModel" />
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
                  <PreviewOutput />
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
