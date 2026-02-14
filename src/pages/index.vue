<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center">
    <div class="flex-1 flex flex-col items-center justify-center">
      <Image :src="FavIcon" alt="FavIcon" width="256" height="256" />

      <h3>由 {{ serverProvider }} 提供的</h3>
      <h1 class="text-4xl">{{ serverName }} 服务器</h1>

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

      <div class="font-thin text-xs">
        <router-link class="underline" to="/manual">手动连接</router-link>

        <template v-if="protocol === 'http:' || protocol === 'https:'">
          <a>&nbsp;|&nbsp;</a>
          <a class="underline" :href="appDownUrl" target="_blank">下载客户端</a>
        </template>
      </div>
    </div>

    <Dialog v-model:visible="steamConnectDialog" modal header="正在连接到服务器…">
      <p>如果没有任何反应，请确认已安装并登录 Steam 客户端。</p>

      <template #footer>
        <Button label="关闭" severity="secondary" @click="steamConnectDialog = false" autofocus />
      </template>
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
import GlobalFooter from '@/components/GlobalFooter.vue'
import { DNSError, getDNSStatusMessage, resolveHostToIPv4 } from '@/dns'

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

// 消息
const toast = useToast()
const protocol = window.location.protocol

// 环境变量
const serverProvider = import.meta.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'
const serverName = import.meta.env.VITE_SRCDS_SERVER_NAME ?? 'Left 4 Dead 2'
const serverAddr = import.meta.env.VITE_SRCDS_SERVER_ADDRESS ?? 'example.com'
const serverPort = import.meta.env.VITE_SRCDS_SERVER_PORT ?? '27015'

// APP 下载链接
const appDownUrl = `https://github.com/${/^[A-Za-z]+$/.test(serverProvider) ? serverProvider : 'GitHub'}/l4d2-server-introduce/releases/latest`

// 服务器连接协议链接
const steamConnectLink: Ref<BtnConnectStatus | string> = ref(BtnConnectStatus.RESOLVING)
const steamConnectDialog = ref(false)

// 按钮样式
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
 * 生成Steam服务器连接的渐进式连接
 * @param address 地址
 * @param port 端口
 */
async function generateSteamBrowserProtocol(address: string, port: string): Promise<string> {
  const ip = await resolveHostToIPv4(address)

  if (!port) {
    return `steam://connect/${ip}`
  }

  return `steam://connect/${ip}:${port}`
}

/**
 * 刷新渐进式连接
 */
async function refreshSteamConnectLink() {
  try {
    steamConnectLink.value = BtnConnectStatus.RESOLVING
    steamConnectLink.value = await generateSteamBrowserProtocol(serverAddr, serverPort)
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
 * 运行服务器连接协议链接
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
  document.title = `由 ${serverProvider} 提供的 ${serverName} 服务器`
})
</script>
