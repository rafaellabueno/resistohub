import { api } from "@/utils/api"
import { useRouter } from "next/router"
import { lang } from "../../schemas/zodSchemas"
export const useChangeLang = () => {
  const { push, pathname, asPath } = useRouter()

  const changeLanguage = api.user.changeLang.useMutation()
  const changeLanguagePub = api.user.changeLangPublic.useMutation()
  const me = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });
  const handleLanguageChange = async (e: string) => {
    const newLocale = e

    lang.changeLanguage(newLocale.split("-")[0] ?? "en")
    //
    if (me?.data?.id) {
      // @ts-ignore
      await changeLanguage.mutateAsync(newLocale)
    } else {
      // @ts-ignore
      await changeLanguagePub.mutateAsync(newLocale)
    }

    await push(pathname, asPath, { locale: newLocale })
  }

  return handleLanguageChange
}
