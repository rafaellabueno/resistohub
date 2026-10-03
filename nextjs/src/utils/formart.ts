export const formatUtcDate = (
  utcDate: string | number | Date | null | undefined,
  showTime = false,
): string => {
  if (!utcDate) return ""

  const date = new Date(utcDate)

  const day = date.getUTCDate().toString().padStart(2, "0")
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
  const year = date.getUTCFullYear()

  let formattedDate = `${day}/${month}/${year} `

  if (showTime) {
    const hours = date.getUTCHours().toString().padStart(2, "0")
    const minutes = date.getUTCMinutes().toString().padStart(2, "0")
    formattedDate = `${formattedDate} ${hours}:${minutes}`
  }

  return `${formattedDate} (UTC)`
}
