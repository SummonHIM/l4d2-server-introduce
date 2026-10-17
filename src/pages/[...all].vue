<template>
  <div class="zombie-bg" aria-hidden="true"></div>

  <div class="relative min-h-screen flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center text-center px-6">
      <h2 class="font-display text-6xl md:text-7xl text-blood">404</h2>
      <h3 class="mt-2 text-3xl text-bone">页面未找到</h3>
      <p class="mb-8 text-bone/60">NotFound</p>
      <Button as-child raised severity="secondary" v-slot="slotProps">
        <RouterLink to="/" :class="slotProps.class">返回首页</RouterLink>
      </Button>
    </div>

    <footer class="relative">
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NotFoundPage',
})
</script>
