import { cn } from "@/lib/utils"
import { api } from "@/utils/api"
import { formatCoin } from "@/utils/formart"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import type React from "react"
import "react-tooltip/dist/react-tooltip.css"
import { Progress } from "./ui/progress"
import { EditServiceContractName } from "./editServiceContractName"
import { useRouter } from "next/router"

export const CardHeader = (props: {
  children: React.ReactNode
  size: "lg" | "default"
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800",
        props.size === "lg" ? "text-lg font-semibold" : "text-sm font-medium",
      )}
    >
      {props.children}
    </div>
  )
}

export const CardBody = (props: { children: React.ReactNode }) => {
  return <div className="px-4 py-3">{props.children}</div>
}

export const CardFooter = (props: { children: React.ReactNode }) => {
  return (
    <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
      {props.children}
    </div>
  )
}

export const BalanceCard = ({
  title,
  value,
  loading,
  children,
  text,
}: {
  title: string
  value?: number
  loading?: boolean
  children?: React.ReactNode
  text?: string
}) => {
  const [parent] = useAutoAnimate()

  const { query } = useRouter()
  const me = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });
  const id = query?.id ?? me.data?.id
  const userCoin = api.user.getUserCoin.useQuery(Number(id), {
    enabled: !!id,
  })
  const coin = userCoin.data ?? "USDT"

  return (
    <div
      className="border-border bg-secondary min-h-32 grid w-full gap-3 rounded-md border-[1px] p-4"
      ref={parent}
    >
      <p className="font-semibold">{title}</p>

      {loading ? (
        <>
          <div className="h-7 w-full animate-pulse rounded-sm bg-gray-300 text-xl font-semibold dark:bg-gray-500" />
        </>
      ) : (
        <div className="flex flex-wrap justify-between">
          <p className="blur-value text-2xl font-semibold">
            {text ?? formatCoin(value, coin)}
          </p>
          {children}
        </div>
      )}
    </div>
  )
}

export const BalanceCardAdmin = ({
  title,
  valueBRL,
  valueUSDT,
  loading,
  children,
}: {
  title: string
  valueBRL?: number
  valueUSDT?: number
  loading?: boolean
  children?: React.ReactNode
}) => {
  const [parent] = useAutoAnimate()

  return (
    <div
      className="border-border bg-secondary min-h-32 grid w-full gap-3 rounded-md border-[1px] p-4"
      ref={parent}
    >
      <p className="font-semibold">{title}</p>

      {loading ? (
        <div className="h-7 w-full animate-pulse rounded-sm bg-gray-300 text-2xl font-semibold dark:bg-gray-500" />
      ) : (
        <>
          <div className="flex flex-wrap justify-between">
            <p className="blur-value text-2xl font-semibold">
              {formatCoin(valueBRL, "BRL")}
            </p>
            {children}
          </div>
          <div className="flex flex-wrap justify-between">
            <p className="blur-value text-2xl font-semibold">
              {formatCoin(valueUSDT, "USDT")}
            </p>
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export const ServiceCard = ({
  service,
}: {
  service: {
    name?: string
    totalService?: number
    gain?: number
    coinUser?: "USDT" | "BRL" | null
    nameUserService?: string | null

    id: number
  }
}) => {
  return (
    <div className="border-border bg-secondary flex flex-col rounded-md border-[1px] border-b-0">
      <div className="grid gap-5 p-4 dark:text-white">
        <p className="text-lg">
          Total
          <span className="font-bold ml-1">
            {service.nameUserService || service.name}
          </span>
          <EditServiceContractName service={service} />
        </p>
        <div className="flex justify-between">
          <div>{formatCoin(service.totalService, service.coinUser ?? "BRL")}</div>
          <p className="text-4xl font-semibold text-[#A06FFE]">
            {service.gain?.toFixed(2)}
            <span>%</span>
          </p>
        </div>
      </div>
      <Progress className="mt-auto" value={service.gain} />
    </div>
  )
}
