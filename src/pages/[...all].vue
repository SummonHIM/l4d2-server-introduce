<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center text-center">
      <h2 class="text-3xl">页面未找到</h2>
      <p class="mb-8">404 Not Found</p>
      <Button as-child raised severity="secondary" v-slot="slotProps">
        <RouterLink to="/" :class="slotProps.class">返回首页</RouterLink>
      </Button>
    </div>

    <footer>
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

defineOptions({
  name: 'NotFoundPage',
})

const serverProvider = import.meta.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'
const serverName = import.meta.env.VITE_SRCDS_SERVER_NAME ?? 'Left 4 Dead 2'

onMounted(async () => {
  document.title = `页面未找到 - 由 ${serverProvider} 提供的 ${serverName} 服务器`
})
</script>
