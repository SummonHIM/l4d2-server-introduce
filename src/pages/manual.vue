<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 mx-auto pt-8 pb-8 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[70%]">
      <GlobalToolbar v-model="menuSelected" :buttons="menuItems" class="mb-2" />

      <TutorialCard class="mb-2" :images="galleriaECImages">
        <template #title>第一步：启用控制台</template>
        <template #content>
          <p>
            1. 在主菜单中，单击<code>选项</code>→<code>键盘/鼠标</code>，进入键盘/鼠标设置页面。
          </p>
          <p>2. 将<code>允许使用开发者控制台</code>设置为<code>已启用</code>。</p>
        </template>
      </TutorialCard>

      <TutorialCard :images="galleriaCVCImages">
        <template #title>第二步：连接到服务器</template>
        <template #content>
          <div class="flex">
            <InputGroup>
              <FloatLabel variant="on">
                <InputText
                  id="console_connect_command"
                  type="text"
                  v-model="consoleConnectCommand"
                  fluid
                />
                <label for="console_connect_command">进服命令</label>
              </FloatLabel>
              <InputGroupAddon>
                <Button
                  icon="pi pi-copy"
                  severity="secondary"
                  variant="text"
                  @click="copy(consoleConnectCommand, toast)"
                />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <p>1. 按下打开控制台的按键<code>`~</code>（标点和波浪线）打开控制台。</p>
          <p>2. 将以上进服命令复制到控制台输入框中，并按下回车。</p>
        </template>
      </TutorialCard>
    </div>

    <footer>
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import IMGConnectViaConsole from '@/assets/images/connect_via_console.png'
import IMGEnableConsole1 from '@/assets/images/enable_console_1.png'
import IMGEnableConsole2 from '@/assets/images/enable_console_2.png'
import IMGThumbConnectViaConsole from '@/assets/images/thumb_connect_via_console.png'
import IMGThumbEnableConsole1 from '@/assets/images/thumb_enable_console_1.png'
import IMGThumbEnableConsole2 from '@/assets/images/thumb_enable_console_2.png'
import type { GlobalTabbarButtonProps } from '@/components/GlobalToolbar.vue'
import { copy } from '@/utils'

defineOptions({
  name: 'ManualPage',
})

const toast = useToast()
const consoleConnectCommand = ref(
  `connect ${import.meta.env.VITE_SRCDS_SERVER_ADDRESS}:${import.meta.env.VITE_SRCDS_SERVER_PORT}`,
)

// 返回菜单
const menuItems: GlobalTabbarButtonProps[] = [
  {
    id: 'back',
    label: '返回',
    icon: 'pi pi-arrow-left',
    hidden: false,
    href: '/',
  },
  {
    id: 'back-hidden',
    label: '返回',
    icon: 'pi pi-arrow-left',
    hidden: true,
  },
]
const menuSelected = ref<GlobalTabbarButtonProps>(
  menuItems.find((item) => item.id === 'back-hidden')!,
)

// 启用控制台教程图像
const galleriaECImages = ref([
  {
    alt: 'Enable Console tips 1',
    itemImageSrc: IMGEnableConsole1,
    thumbnailImageSrc: IMGThumbEnableConsole1,
  },
  {
    alt: 'Enable Console tips 2',
    itemImageSrc: IMGEnableConsole2,
    thumbnailImageSrc: IMGThumbEnableConsole2,
  },
])

// 连接服务器教程图像
const galleriaCVCImages = ref([
  {
    alt: 'Connect via Console',
    itemImageSrc: IMGConnectViaConsole,
    thumbnailImageSrc: IMGThumbConnectViaConsole,
  },
])
</script>
