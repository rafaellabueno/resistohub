import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { clientContent } from "@/language/client"
import { api } from "@/utils/api"
import {
  Loader,
  Store,
  Apple,
  Copy,
  CheckCircle2,
  KeyRound,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/router"
import { QRCodeSVG } from "qrcode.react"
import React from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TwoFa({ children }: { children: React.ReactNode }) {
  const generate = api.auth.createTwoFA.useMutation({
    onSuccess: () => {
      setStep("saveCode")
    },
  })
  const { locale } = useRouter()
  const [open, setOpen] = React.useState(false)
  const { doisfa: content } = clientContent[locale as keyof typeof clientContent]

  const [step, setStep] = React.useState<"download" | "saveCode" | "verify">("download")

  const handleNext = () => {
    if (step === "download") {
      generate.mutate()
      return
    }
    if (step === "saveCode") {
      setStep("verify")
      return
    }
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="lg:w-3/4 lg:max-w-full">
        <SheetHeader>
          <SheetTitle>Google Authenticator (2FA)</SheetTitle>
        </SheetHeader>
        <div className="mx-auto flex w-fit flex-col items-center justify-center gap-4">
          {step === "download" && <DownloadApp />}
          {step === "saveCode" && (
            <SaveCode uri={generate.data?.uri ?? ""} code={generate.data?.secret ?? ""} />
          )}
          {step === "verify" && (
            <VerifyCode secret={generate.data?.secret ?? ""} handleNext={handleNext} />
          )}

          {step !== "verify" && (
            <Button
              onClick={handleNext}
              disabled={generate.isLoading}
              className="mx-auto w-full"
            >
              {generate.isLoading && <Loader className="mr-2 animate-spin" />}
              {content.next}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface VerifyCodeProps {
  secret: string
  handleNext: () => void
}

const VerifyCode = ({ secret, handleNext }: VerifyCodeProps) => {
  const [code, setCode] = React.useState("")
  const [isInvalid, setIsInvalid] = React.useState(false)
  const verify = api.auth.saveTwoFa.useMutation({
    onSuccess: () => handleNext(),
    onError: () => setIsInvalid(true),
  })

  const { locale } = useRouter()
  const { doisfa: content } = clientContent[locale as keyof typeof clientContent]

  const handleVerify = () => {
    setIsInvalid(false)
    verify.mutate({
      secret,
      otp: code,
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <KeyRound className="w-12 h-12 mx-auto text-accent" />
        <CardTitle className="text-2xl font-bold">{content.typeCode}</CardTitle>
        <CardDescription>{content.typeAuthenticator}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4 text-center">
          <Label
            htmlFor="code"
            className="block text-center text-sm text-muted-foreground"
          >
            {content.code}
          </Label>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              id="code"
              onChange={(value) => {
                setCode(value)
                setIsInvalid(false)
              }}
              value={code}
              inputMode="numeric"
              pattern={REGEXP_ONLY_DIGITS}
              onPaste={(e) => {
                e.preventDefault()
                const pastedText = e.clipboardData.getData("text")
                const sanitizedText = pastedText.replace(/\D/g, "")
                setCode(sanitizedText)
              }}
              className={`flex justify-center text-center ${isInvalid ? "border-red-500" : ""}`}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {isInvalid && (
            <p className="text-red-500 text-sm text-center">{content.invalidCode}</p>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={verify.isLoading || code.length !== 6}
          className="w-full relative"
          size="lg"
        >
          {verify.isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              {content.verifying}
            </>
          ) : verify.isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {content.verified}
            </>
          ) : (
            content.verify
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

const DownloadApp = () => {
  const [selected, setSelected] = React.useState(
    "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=pt_BR&gl=US",
  )

  const android =
    "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=pt_BR&gl=US"
  const ios = "https://apps.apple.com/br/app/google-authenticator/id388497605"

  const { locale } = useRouter()
  const { doisfa: content } = clientContent[locale as keyof typeof clientContent]

  return (
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{content.download}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="flex justify-center gap-4">
          <Button
            className={`flex items-center gap-2 transition-all ${
              selected === android
                ? "bg-accent text-accent-foreground shadow-lg scale-105"
                : "hover:bg-accent/10"
            }`}
            variant="ghost"
            onClick={() => setSelected(android)}
            size="lg"
          >
            <Store className="w-5 h-5" />
            Play Store
          </Button>
          <Button
            className={`flex items-center gap-2 transition-all ${
              selected === ios
                ? "bg-accent text-accent-foreground shadow-lg scale-105"
                : "hover:bg-accent/10"
            }`}
            variant="ghost"
            onClick={() => setSelected(ios)}
            size="lg"
          >
            <Apple className="w-5 h-5" />
            App Store
          </Button>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <QRCodeSVG value={selected} size={200} />
        </div>

        <p className="text-sm text-muted-foreground text-center">{content.qrcode}</p>
      </CardContent>
    </Card>
  )
}

interface SaveCodeProps {
  uri: string
  code: string
}

const SaveCode = ({ uri, code }: SaveCodeProps) => {
  const [copied, setCopied] = React.useState(false)
  const { locale } = useRouter()
  const { doisfa: content } = clientContent[locale as keyof typeof clientContent]

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{content.scan}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <QRCodeSVG value={uri} size={200} />
        </div>

        <div className="w-full">
          <p className="text-center mb-2 text-muted-foreground">{content.type}</p>

          <div
            className="flex items-center justify-center gap-2 bg-accent/10 p-4 rounded-lg cursor-pointer hover:bg-accent/20 transition-colors"
            onClick={copyToClipboard}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                copyToClipboard()
              }
            }}
          >
            <span className="font-mono text-lg font-semibold text-accent">{code}</span>
            {copied ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded">
          <p className="text-sm text-orange-700 dark:text-orange-300">{content.save}</p>
        </div>
      </CardContent>
    </Card>
  )
}
