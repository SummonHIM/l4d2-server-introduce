<template>
  <div v-bind="$attrs" class="mx-1 mt-1 mb-1 text-center text-bone/60">
    <p class="text-sm">
      © {{ currentYear }} {{ srcdsEnv.provider }} |
      <a
        class="underline hover:text-blood transition-colors"
        href="https://github.com/SummonHIM/l4d2-server-introduce"
        target="_blank"
        rel="noopener"
        @click.prevent="openExternal('https://github.com/SummonHIM/l4d2-server-introduce')"
        >Source Code</a
      >
    </p>
    <p class="font-thin text-xs text-bone/40">
      Left 4 Dead 2 and related assets are trademarks and/or copyrights of Valve Corporation. This
      project is not affiliated with or endorsed by Valve.
    </p>
  </div>
</template>

<script setup lang="ts">
import { srcdsEnv } from '@/srcds'
import { openExternal } from '@/tauri'

const currentYear = new Date().getFullYear()
</script>
