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
                    Script Setup
                  </span>
                </template>
                <template #overflow>
                  <Presence />
                </template>
                <Editor
                  language="javascript"
                  :value="script"
                  type="script"
                  @change="(content) => playground.currentFile.script = content"
                />
              </Container>
            </Pane>
            <Pane>
              <Container>
                <template #title>
                  <mdi-code-tags />
                  <span>
                    Template
                  </span>
                </template>
                <Editor
                  language="html"
                  :value="template"
                  type="template"
                  @change="(content) => playground.currentFile.template = content"
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
                <!-- <pre>
                  {{ playground }}
                </pre> -->
              </div>
            </Container>
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </div>
</template>
