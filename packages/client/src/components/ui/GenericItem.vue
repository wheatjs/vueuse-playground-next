<template>
  <div flex="~ row" items="center">
    <div v-if="$slots.icon" m="r-4">
      <slot name="icon" />
    </div>
    <div flex="~ col 1">
      <span text="dark:(light-900 opacity-70)">
        <slot name="title" />
      </span>
      <span
        text="dark:(light-900 opacity-40) dark-50 opacity-70"
      >
        <slot name="subtitle" />
      </span>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>
