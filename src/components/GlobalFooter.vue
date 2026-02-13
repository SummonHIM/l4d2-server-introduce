<template>
  <div v-bind="$attrs" class="mx-1 mt-1 mb-1 text-center">
    <p>© {{ currentYear }} {{ serverProvider }}</p>
    <p class="font-thin text-xs">
      Left 4 Dead 2 and related assets are trademarks and/or copyrights of Valve Corporation. This
      project is not affiliated with or endorsed by Valve.
    </p>
  </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
const serverProvider = import.meta.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'
</script>
