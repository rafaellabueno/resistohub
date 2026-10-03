const formatUtcDate = (date: Date | null | undefined) => {
  if (!date) return ""
  return `${date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate()}/${
    date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1
  }/${date.getUTCFullYear()}`
}

const roundDown = (value?: number, decimals = 2) => {
  if (!value) return 0
  return Math.floor(value * 10 ** decimals) / 10 ** decimals
}

const createRandomCode = () => {
  const number = `${Math.floor(
    Math.random() * (99 - 10 + 1) + 10,
  )}${Math.floor(Math.random() * (99 - 10 + 1) + 10)}${Math.floor(
    Math.random() * (99 - 10 + 1) + 10,
  )}${Math.floor(Math.random() * (99 - 10 + 1) + 10)}`
  const numberWithSpaces = number.match(/.{1,2}/g)?.join(" ")
  return { number, numberWithSpaces }
}

export const formats = {
  formatUtcDate,
  roundDown,
  createRandomCode,
}
