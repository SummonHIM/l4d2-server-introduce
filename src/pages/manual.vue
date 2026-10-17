<template>
  <div class="zombie-bg" aria-hidden="true"></div>

  <div class="relative min-h-screen flex flex-col">
    <div class="flex-1 mx-auto pt-8 pb-8 container max-w-3xl px-4">
      <div class="mb-6">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-bone/70 hover:text-blood transition-colors"
        >
          <i class="pi pi-arrow-left"></i>
          返回首页
        </RouterLink>
      </div>

      <h1 class="font-display text-4xl md:text-5xl tracking-wide text-bone mb-8">手动连接服务器</h1>

      <section class="mb-6 rounded-lg border border-white/10 bg-black/40 p-6">
        <h2 class="text-xl font-semibold text-bone mb-3">
          <span class="text-blood mr-2">第一步</span>启用控制台
        </h2>
        <ol class="list-decimal list-inside space-y-2 text-bone/80">
          <li>在主菜单中，单击<code>选项</code>→<code>键盘/鼠标</code>，进入键盘/鼠标设置页面。</li>
          <li>将<code>允许使用开发者控制台</code>设置为<code>已启用</code>。</li>
        </ol>
      </section>

      <section class="mb-6 rounded-lg border border-white/10 bg-black/40 p-6">
        <h2 class="text-xl font-semibold text-bone mb-3">
          <span class="text-blood mr-2">第二步</span>连接到服务器
        </h2>

        <div class="mb-4 rounded-md border border-black/60 bg-[#101010] shadow-inner font-mono">
          <div class="flex items-center gap-1.5 border-b border-black/60 bg-[#161616] px-3 py-2">
            <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
            <span class="ml-2 text-xs text-bone/50">~ developer console</span>
          </div>
          <div class="flex items-center justify-between gap-2 px-3 py-3">
            <code class="!bg-transparent text-blood">connect {{ srcdsEnv.addr }}:{{ srcdsEnv.port }}</code>
            <Button
              icon="pi pi-copy"
              severity="secondary"
              variant="text"
              aria-label="复制进服命令"
              @click="copy(consoleConnectCommand, toast)"
            />
          </div>
        </div>

        <ol class="list-decimal list-inside space-y-2 text-bone/80">
          <li>按下打开控制台的按键<code>`~`</code>（标点和波浪线）打开控制台。</li>
          <li>将以上进服命令复制到控制台输入框中，并按下回车。</li>
        </ol>
      </section>
    </div>

    <footer class="relative">
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { srcdsEnv } from '@/srcds'
import { copy } from '@/utils'

defineOptions({
  name: 'ManualPage',
})

const toast = useToast()
const consoleConnectCommand = ref(`connect ${srcdsEnv.addr}:${srcdsEnv.port}`)
</script>
