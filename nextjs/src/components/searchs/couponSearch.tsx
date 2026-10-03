import { debounce } from "@/utils/debounce"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { api } from "@/utils/api"
import React from "react"
import { Check, X } from "lucide-react"
import { useRouter } from "next/router"
import { clientContent } from "@/language/client"

export const CouponSearch = ({
  serviceId,
  couponType,
  userId,
  serviceMigrationId,
  setCoupon,
}: {
  serviceId: number
  couponType: "purchase" | "withdraw" | "migration"
  userId: number
  serviceMigrationId?: number | null
  setCoupon: (coupon: string | null) => void
}) => {
  const [value, setValue] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const { locale } = useRouter()
  const { coupon: content } = clientContent[locale as keyof typeof clientContent]

  const { data } = api.coupons.couponSeach.useQuery(
    {
      serviceId,
      couponType,
      code: debouncedSearch,
      userId,
      serviceMigrationId: serviceMigrationId ?? undefined,
    },
    {
      enabled: debouncedSearch.length > 3,
    },
  )

  React.useEffect(() => {
    if (data?.coupon) {
      setCoupon(data.coupon.code!)
      return
    }
    setCoupon(null)
  }, [data?.coupon])

  debounce(() => {
    setDebouncedSearch(value)
  }, 400)

  return (
    <div className="flex w-full flex-col justify-between gap-3">
      <Label htmlFor="coupon">{content.coupon}</Label>
      <div className="relative flex">
        <Input
          placeholder={content.coupon}
          id="coupon"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {data?.coupon ? (
          <Check className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" />
        ) : (
          value !== "" && (
            <X className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" />

          )
        )}
      </div>
      {!data?.coupon && value !== "" && (
        <span className="text-muted-foreground text-sm text-red-500">{content.invalidCoupon}</span>
      )}
    </div>
  )
}
