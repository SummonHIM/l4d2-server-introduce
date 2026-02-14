<template>
  <Card>
    <template #title>
      <slot name="title"></slot>
    </template>

    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-9">
          <slot name="content"></slot>
        </div>

        <div class="col-span-12 lg:col-span-3" v-if="images && images.length">
          <div ref="viewerContainer" class="flex lg:justify-center gap-2 mt-2 flex-wrap">
            <img
              v-for="(image, index) in images"
              :key="index"
              :src="image.thumbnailImageSrc"
              :data-original="image.itemImageSrc"
              :alt="image.alt"
              class="cursor-pointer max-w-25 border rounded"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

const props = defineProps<{
  images?: { alt: string; itemImageSrc: string; thumbnailImageSrc: string }[]
}>()

const viewerContainer = ref<HTMLDivElement>()
let viewerInstance: Viewer | null = null

onMounted(() => {
  if (viewerContainer.value && props.images && props.images.length) {
    viewerInstance = new Viewer(viewerContainer.value, {
      url: 'data-original', // 指定点击图片显示原图
    })
  }
})

watch(
  () => props.images,
  (newImages) => {
    if (viewerInstance) {
      viewerInstance.destroy()
      if (viewerContainer.value && newImages && newImages.length) {
        viewerInstance = new Viewer(viewerContainer.value, {
          url: 'data-original',
        })
      }
    }
  },
)

onBeforeUnmount(() => {
  if (viewerInstance) viewerInstance.destroy()
})
</script>
