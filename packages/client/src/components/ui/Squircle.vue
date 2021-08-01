<script setup lang="ts">
defineProps<{
  image?: string
}>()
</script>

<template>
  <svg viewBox="0 0 200 200">
    <path
      d="
                M 0, 100
                C 0, 12 12, 0 100, 0
                S 200, 12 200, 100
                    188, 200 100, 200
                    0, 188 0, 100
            "
      fill="currentColor"
    >
    </path>
    <mask id="mask">
      <path
        d="
                  M 0, 100
                  C 0, 12 12, 0 100, 0
                  S 200, 12 200, 100
                      188, 200 100, 200
                      0, 188 0, 100
              "
        fill="white"
      >
      </path>
    </mask>
    <image :xlink:href="image" width="200" height="200" mask="url(#mask)"></image>
  </svg>
</template>
