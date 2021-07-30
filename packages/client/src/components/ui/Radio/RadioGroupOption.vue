<script setup lang="ts">
import { RadioGroupOption as HeadlessRadioGroupOption, RadioGroupLabel, RadioGroupDescription } from '@headlessui/vue'
</script>

<template>
  <HeadlessRadioGroupOption v-slot="{ checked, active }" outline="focus:none">
    <div
      border="1 rounded dark:dark-900"
      cursor="pointer"
      bg="dark:dark-500"
      flex="~ row"
      p="4"
      items="center"
      overflow="hidden"
      :class="{
        '!border-green-500': checked,
        'ring-3 ring-green-300': active,
      }"
    >
      <div text="4xl">
        <slot name="icon" />
      </div>
      <div flex="~ col 1" m="l-4">
        <span font="medium">
          <slot name="label" />
        </span>
        <span text="dark:(light-900 opacity-70)">
          <slot />
        </span>
      </div>
      <div
        v-if="checked"
        w="8"
        h="8"
        bg="green-400"
        border="rounded-full"
        text="lg green-900"
        flex="~"
        place="content-center items-center"
      >
        <mdi-check />
      </div>
    </div>
  </HeadlessRadioGroupOption>
</template>
