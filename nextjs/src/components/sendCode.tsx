import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import { clientContent } from "@/language/client"
import { api } from "@/utils/api"
import { useEffect, useState } from "react"

export const SendCode = ({
  email,
  onCodeSent,
}: { email: string; onCodeSent?: () => void }) => {
  const { locale } = useRouter()
  const { reset: content } = clientContent[locale as keyof typeof clientContent]
  const [time, setTime] = useState(0)

  const sendCode = api.auth.sendResetPassword.useMutation({
    onMutate: () => setTime(60),
    onSuccess: () => {
      onCodeSent?.()
    },
  })

  useEffect(() => {
    if (time <= 0) return

    const timer = setInterval(() => {
      setTime((prevTime) => prevTime - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [time])

  return (
    <Button
      type="button"
      className="flex flex-col gap-4 rounded-l-none"
      disabled={time > 0}
      onClick={() => {
        sendCode.mutate(email)
      }}
    >
      {content.sendCode} {time > 0 ? `${time}s` : ""}
    </Button>
  )
}
