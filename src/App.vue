<template>
  <Toast />

  <Dialog
    v-model:visible="updateDialog"
    modal
    :closable="!updating"
    :header="`发现新版本 ${updateVersion}`"
  >
    <div class="space-y-3">
      <p class="text-bone/80">检测到新版本，是否立即更新？</p>
      <p v-if="updateBody" class="whitespace-pre-wrap text-sm text-bone/60">{{ updateBody }}</p>
      <p v-if="updating" class="text-sm text-blood">正在下载并安装更新，请稍候…</p>
    </div>
    <template #footer>
      <Button
        v-if="!updating"
        label="稍后"
        severity="secondary"
        variant="text"
        @click="updateDialog = false"
      />
      <Button
        :label="updating ? '更新中…' : '立即更新'"
        :icon="updating ? 'pi pi-spin pi-spinner' : 'pi pi-download'"
        :disabled="updating"
        @click="doUpdate"
      />
    </template>
  </Dialog>

  <main>
    <Suspense>
      <RouterView />
    </Suspense>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { Update } from '@tauri-apps/plugin-updater'

import { isTauri } from '@/tauri'

const updateDialog = ref(false)
const updateVersion = ref('')
const updateBody = ref('')
const updating = ref(false)

let pendingUpdate: Update | null = null

onMounted(() => {
  // 仅在 Tauri 桌面客户端中检查更新
  if (!isTauri()) return
  void checkForUpdate()
})

async function checkForUpdate() {
  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (!update) return

    pendingUpdate = update
    updateVersion.value = update.version
    updateBody.value = update.body ?? ''
    updateDialog.value = true
  } catch (error) {
    console.error('检查更新失败', error)
  }
}

async function doUpdate() {
  if (!pendingUpdate) return
  updating.value = true

  try {
    await pendingUpdate.downloadAndInstall()
    const { relaunch } = await import('@tauri-apps/plugin-process')
    await relaunch()
  } catch (error) {
    console.error('安装更新失败', error)
    updating.value = false
  }
}
</script>
