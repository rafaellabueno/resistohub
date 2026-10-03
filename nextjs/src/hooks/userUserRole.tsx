import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"

type Roles = "admin" | "client" | "consultant" | "head" | undefined

const userRoleAtom = atomWithStorage<Roles>("userRole", undefined)

export const useUserRole = () => {
  const [userRole, setUserRole] = useAtom(userRoleAtom)

  const changeRole = (newRole: Roles) => {
    setUserRole(newRole)
  }

  return {
    userRole,
    changeRole,
  }
}
