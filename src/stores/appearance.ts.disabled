import { defineStore } from 'pinia'

interface Appearance {
  dark_mode: boolean | 'auto'
}

/** 外观储存 */
export const useAppearanceStore = defineStore('appearance', {
  state: (): Appearance => ({
    dark_mode: 'auto',
  }),
  persist: true,
})
