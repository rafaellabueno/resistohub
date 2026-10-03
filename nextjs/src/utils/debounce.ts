let timeout: NodeJS.Timeout
export const debounce = async (fn: () => void, ms: number) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    fn()
  }, ms)
}
