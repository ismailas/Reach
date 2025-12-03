import { ref, computed, onUnmounted } from 'vue'

export function useTimer() {
  const elapsedSeconds = ref(0)
  const isRunning = ref(false)
  const startTime = ref<Date | null>(null)
  let intervalId: number | null = null

  const formattedTime = computed(() => {
    const hours = Math.floor(elapsedSeconds.value / 3600)
    const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
    const seconds = elapsedSeconds.value % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const start = () => {
    if (isRunning.value) return
    
    isRunning.value = true
    startTime.value = new Date()
    
    intervalId = window.setInterval(() => {
      if (startTime.value) {
        const now = new Date()
        elapsedSeconds.value = Math.floor((now.getTime() - startTime.value.getTime()) / 1000)
      }
    }, 1000)
  }

  const stop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  const reset = () => {
    stop()
    elapsedSeconds.value = 0
    startTime.value = null
  }

  const resume = (initialSeconds: number) => {
    if (isRunning.value) return
    
    elapsedSeconds.value = initialSeconds
    startTime.value = new Date(Date.now() - initialSeconds * 1000)
    start()
  }

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    elapsedSeconds,
    isRunning,
    formattedTime,
    start,
    stop,
    reset,
    resume
  }
}

