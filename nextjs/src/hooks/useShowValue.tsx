import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"

const showValue = atomWithStorage<boolean>("showValue", false)

export const useShowValue = () => {
  const [show, setShowValue] = useAtom(showValue)

  const toggleValue = () => {
    setShowValue(!show)
  }

  return {
    show,
    toggleValue,
  }
}
