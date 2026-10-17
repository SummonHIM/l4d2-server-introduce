<template>
  <div class="zombie-bg md:hidden" aria-hidden="true"></div>
  <div class="bg-slideshow hidden md:block" aria-hidden="true">
    <img
      v-for="(bg, index) in backgrounds"
      :key="bg"
      :src="bg"
      :alt="`背景 ${index + 1}`"
      class="bg-slide"
      :class="{ 'is-active': index === currentBg }"
    />
  </div>
  <div class="zombie-bg-overlay hidden md:block" aria-hidden="true"></div>

  <div class="relative min-h-screen w-full flex flex-col justify-center">
    <div class="flex-1 flex flex-col justify-center px-6 py-12 text-center">
      <div
        class="w-full max-w-3xl mx-auto md:rounded-2xl md:border md:border-white/10 md:bg-black/50 md:px-12 md:py-14 md:backdrop-blur-md md:shadow-2xl"
      >
        <div class="relative inline-block">
          <img
            :src="SummonHimLogo"
            alt="SummonHIM Logo"
            class="h-44 w-44 md:h-64 md:w-64 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          />
          <img
            :src="L4D2Badge"
            alt="Left 4 Dead 2"
            class="absolute -right-4 -top-4 h-14 w-14 md:h-20 md:w-20 rounded-md shadow-lg"
          />
        </div>

        <p class="mt-8 text-sm uppercase tracking-[0.4em] text-bone/60">
          由 {{ srcdsEnv.provider }} 提供
        </p>
        <h1
          class="font-display mt-2 text-6xl md:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-bone to-blood/80 drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]"
        >
          LEFT 4 DEAD 2
        </h1>
        <p
          class="font-black mt-4 text-4xl md:text-6xl tracking-[0.3em] text-blood drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
        >
          服务器
        </p>

        <div class="mt-10">
          <Button
            :as="buttonConfig.href ? 'a' : undefined"
            :href="buttonConfig.href"
            :label="buttonConfig.label"
            :icon="buttonConfig.icon"
            :severity="buttonConfig.severity"
            size="large"
            raised
            class="!px-10 !py-4 !text-lg"
            @click="buttonConfig.click"
          />
        </div>

        <div class="mt-6 text-sm text-bone/60">
          <router-link class="underline hover:text-blood transition-colors" to="/manual"
            >手动连接</router-link
          >

          <template v-if="!inTauri">
            <span>&nbsp;|&nbsp;</span>
            <a
              class="underline hover:text-blood transition-colors"
              :href="appDownUrl"
              target="_blank"
              rel="noopener"
              @click.prevent="openExternal(appDownUrl)"
              >下载客户端</a
            >
          </template>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="steamConnectDialog" modal header="正在连接到服务器…">
      <p>如果没有任何反应，请确认已安装并登录 Steam 客户端。</p>
    </Dialog>

    <footer class="relative w-full">
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { type ComputedRef, type Ref, computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { AxiosError } from 'axios'
import { useToast } from 'primevue'

import BG1 from '@/assets/backgrounds/bg-1.jpg'
import BG2 from '@/assets/backgrounds/bg-2.jpg'
import BG3 from '@/assets/backgrounds/bg-3.jpg'
import BG4 from '@/assets/backgrounds/bg-4.jpg'
import L4D2Badge from '@/assets/logo/l4d2-badge.png'
import SummonHimLogo from '@/assets/logo/summonhim.svg'
import { DNSError, getDNSStatusMessage } from '@/dns'
import { generateSteamBrowserProtocol, srcdsEnv } from '@/srcds'
import { isTauri, openExternal, openSteamConnect } from '@/tauri'

enum BtnConnectStatus {
  ERROR = 1,
  RESOLVING = 2,
  RESOLVERROR = 3,
  NETERROR = 4,
}

interface ButtonConfig {
  href?: string
  label: string
  icon: string
  severity: string
  click?: () => void
}

defineOptions({
  name: 'HomePage',
})

const toast = useToast()
const inTauri = isTauri()

const appDownUrl = `https://github.com/${srcdsEnv.provider ?? 'GitHub'}/l4d2-server-introduce/releases/latest`

const steamConnectLink: Ref<BtnConnectStatus | string> = ref(BtnConnectStatus.RESOLVING)
const steamConnectDialog = ref(false)

const backgrounds = [BG1, BG2, BG3, BG4]
const currentBg = ref(0)
let bgTimer: number | undefined

const buttonConfig: ComputedRef<ButtonConfig> = computed(() => {
  if (typeof steamConnectLink.value === 'string') {
    return {
      label: '开始游戏',
      icon: 'pi pi-play-circle',
      severity: 'success',
      click: launchSteamConnectLink,
    }
  }

  switch (steamConnectLink.value) {
    case BtnConnectStatus.RESOLVING:
      return { label: '正在查询', icon: 'pi pi-spin pi-spinner', severity: 'secondary' }

    case BtnConnectStatus.RESOLVERROR:
      return {
        label: '查询错误',
        icon: 'pi pi-exclamation-triangle',
        severity: 'danger',
        click: refreshSteamConnectLink,
      }

    case BtnConnectStatus.NETERROR:
      return {
        label: '网络错误',
        icon: 'pi pi-exclamation-triangle',
        severity: 'danger',
        click: refreshSteamConnectLink,
      }

    default:
    case BtnConnectStatus.ERROR:
      return {
        label: '未知错误',
        icon: 'pi pi-exclamation-triangle',
        severity: 'danger',
        click: refreshSteamConnectLink,
      }
  }
})

async function refreshSteamConnectLink() {
  try {
    steamConnectLink.value = BtnConnectStatus.RESOLVING
    steamConnectLink.value = await generateSteamBrowserProtocol(srcdsEnv.addr, srcdsEnv.port)
  } catch (error) {
    switch (true) {
      case error instanceof DNSError:
        console.error(error)
        steamConnectLink.value = BtnConnectStatus.RESOLVERROR
        toast.add({
          severity: 'error',
          summary: '查询IP地址时发生错误',
          detail: `查询IP地址失败。DNS服务器响应：${getDNSStatusMessage(error.status)}。`,
          life: 5000,
        })
        break

      case error instanceof AxiosError:
        console.error(error)
        steamConnectLink.value = BtnConnectStatus.NETERROR
        toast.add({
          severity: 'error',
          summary: '查询IP地址时发生错误',
          detail: `网络错误。请检查网络连接。(${error.message})`,
          life: 5000,
        })
        break

      default:
      case error instanceof Error:
        console.error(error)
        steamConnectLink.value = BtnConnectStatus.ERROR
        toast.add({
          severity: 'error',
          summary: '查询IP地址时发生错误',
          detail: '发生未知错误！请查看控制台并将错误信息发送给站点管理员。',
          life: 5000,
        })
        break
    }
  }
}

function launchSteamConnectLink() {
  if (typeof steamConnectLink.value !== 'string') return

  steamConnectDialog.value = true

  setTimeout(() => {
    if (typeof steamConnectLink.value !== 'string') return
    openSteamConnect(steamConnectLink.value)
  }, 500)
}

function startSlideshow() {
  bgTimer = window.setInterval(() => {
    currentBg.value = (currentBg.value + 1) % backgrounds.length
  }, 5000)
}

function stopSlideshow() {
  if (bgTimer !== undefined) {
    window.clearInterval(bgTimer)
    bgTimer = undefined
  }
}

onMounted(async () => {
  refreshSteamConnectLink()
  startSlideshow()
})

onBeforeUnmount(() => {
  stopSlideshow()
})
</script>
