<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
</script>

<template>
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
</template>
