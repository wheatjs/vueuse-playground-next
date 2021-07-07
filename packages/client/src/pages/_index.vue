<script setup lang="ts">
import { ref } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import { Hako } from 'vue-hako'
import Container from '~/components/ui/Container.vue'
import { playground, shouldUpdate } from '~/store'

const script = ref('')
const template = ref('')

shouldUpdate(() => {
  template.value = playground.currentFile.template
  script.value = playground.currentFile.script
})

const onTemplateChange = (content: string) => {
  //
}

const onScriptChange = (content: string) => {
  //
}

// const onTemplateChange = () => {

// }
</script>

<template>
  <div h="full" p="4 l-0">
    <Splitpanes class="default-theme">
      <Pane>
        <div h="full" flex="~ col">
          <EditorTabs></EditorTabs>
          <Splitpanes horizontal>
            <Pane>
              <Container class="rounded-t-none">
                <template #title>
                  <mdi-code-braces />
                  <span>
                    <template v-if="playground.activeFilename === '__APP__'">
                      Main
                    </template>
                    <template v-else>
                      Script Setup
                    </template>
                  </span>
                </template>
                <template #overflow>
                  <Presence />
                </template>
                <Editor
                  language="javascript"
                  :value="script"
                  :model="playground.currentFile.script.model"
                  type="script"
                  @change="onScriptChange"
                />
              </Container>
            </Pane>
            <Pane>
              <Container>
                <template #title>
                  <carbon-settings v-if="playground.activeFilename === '__APP__'" />
                  <mdi-code-tags v-else />
                  <span>
                    <template v-if="playground.activeFilename === '__APP__'">
                      App Settings
                    </template>
                    <template v-else>
                      Template
                    </template>
                  </span>
                </template>

                <Editor
                  v-show="playground.activeFilename !== '__APP__'"
                  language="html"
                  :value="template"
                  :model="playground.currentFile.template.model"
                  type="template"
                  @change="onTemplateChange"
                />
              </Container>
            </Pane>
          </Splitpanes>
        </div>
      </Pane>
      <Pane>
        <Splitpanes horizontal>
          <Pane>
            <Container>
              <template #title>
                <mdi-eye />
                <span>
                  Preview
                </span>
              </template>
              <div h="full">
                <Hako
                  h="full"
                  w="full"
                  :width="100"
                  :height="100"
                  :disable-scaling="true"
                >
                  <Preview h="full" w="full" />
                </Hako>
              </div>
            </Container>
          </Pane>
          <Pane size="25">
            <Container>
              <template #title>
                <mdi-console />
                <span>
                  Console
                </span>
              </template>
              <div h="full" overflow="auto">
                <pre>{{ playground.currentFile.template.text }}</pre>
              </div>
            </Container>
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </div>
</template>
