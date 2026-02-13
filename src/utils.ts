import type { ToastServiceMethods } from 'primevue/toastservice'

export function copy(text: string, toast: ToastServiceMethods) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: '复制成功！',
        life: 2000,
      })
    })
    .catch((error) => {
      console.error(error)
      toast.add({
        severity: 'error',
        summary: '复制文本时发生错误！',
        life: 5000,
      })
    })
}
