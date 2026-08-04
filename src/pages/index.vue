<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center">
    <div class="flex-1 flex flex-col items-center justify-center">
      <Image :src="FavIcon" alt="FavIcon" width="256" height="256" />

      <h3>由 {{ srcdsEnv.provider }} 提供的</h3>
      <h1 class="text-4xl">{{ srcdsEnv.name }} 服务器</h1>

      <div class="mt-6">
        <Button
          :as="buttonConfig.href ? 'a' : undefined"
          :href="buttonConfig.href"
          :label="buttonConfig.label"
          :icon="buttonConfig.icon"
          :severity="buttonConfig.severity"
          size="large"
          raised
          @click="buttonConfig.click"
        />
      </div>

      <div class="font-light text-xs">
        <router-link class="underline" to="/manual">手动连接</router-link>

        <template v-if="protocol === 'http:' || protocol === 'https:'">
          <a>&nbsp;|&nbsp;</a>
          <a class="underline" :href="appDownUrl" target="_blank">下载客户端</a>
        </template>
      </div>
    </div>

    <Dialog v-model:visible="steamConnectDialog" modal header="正在连接到服务器…">
      <p>如果没有任何反应，请确认已安装并登录 Steam 客户端。</p>
    </Dialog>

    <footer>
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { type ComputedRef, type Ref, computed, onMounted, ref } from 'vue'

import { AxiosError } from 'axios'
import { useToast } from 'primevue'

import FavIcon from '@/assets/logo/favicon.png'
import { DNSError, getDNSStatusMessage } from '@/dns'
import { generateSteamBrowserProtocol, srcdsEnv } from '@/srcds'

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
const protocol = window.location.protocol

// APP 下载链接
const appDownUrl = `https://github.com/${srcdsEnv.provider ?? 'GitHub'}/l4d2-server-introduce/releases/latest`

// 服务器连接渐进式链接
const steamConnectLink: Ref<BtnConnectStatus | string> = ref(BtnConnectStatus.RESOLVING)
const steamConnectDialog = ref(false)

// 服务器连接按钮样式
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
      return {
        label: '正在查询',
        icon: 'pi pi-spin pi-spinner',
        severity: 'secondary',
      }

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

/**
 * 刷新渐进式连接
 */
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

/**
 * 跳转到服务器连接渐进式链接
 */
function launchSteamConnectLink() {
  if (typeof steamConnectLink.value !== 'string') return

  steamConnectDialog.value = true

  setTimeout(() => {
    if (typeof steamConnectLink.value !== 'string') return
    window.location.href = steamConnectLink.value
  }, 500)
}

onMounted(async () => {
  refreshSteamConnectLink()
})
</script>
