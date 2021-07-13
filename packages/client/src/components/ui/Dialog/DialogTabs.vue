<script setup lang="ts">
const tabs = ref([])
const activeTab = ref('')
provide('tabs', tabs)
provide('activeTab', activeTab)
</script>

<template>
  <div grid="~ gap-4" class="grid-cols-[200px,auto]">
    <div flex="~ col" space="y-4" border="r-1 dark:dark-900" p="r-4">
      <button
        v-for="tab in tabs"
        :key="tab"
        w="full"
        display="block"
        text="left"
        p="x-4 y-2"
        bg="dark:dark-400"
        border="rounded"
        font="medium"
        :class="{
          '!bg-green-500 !text-green-900': activeTab === tab
        }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>
