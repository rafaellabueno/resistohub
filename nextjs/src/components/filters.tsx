import { cn } from "@/lib/utils"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/router"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { es, ptBR, enUS } from "date-fns/locale"

const pageContent = {
  "en-us": {
    filter: "Filter",
    months: "Months",
    initialDate: "Start Date",
    finalDate: "End Date",
    selectFilter: "Customize",
    pickADate: "Pick a date",
    close: "Close",
    period: "Period",
  },
  "pt-br": {
    filter: "Filtrar",
    months: "Meses",
    initialDate: "Data inicial",
    finalDate: "Data final",
    selectFilter: "Personalizar",
    pickADate: "Escolha uma data",
    close: "Fechar",
    period: "Período",
  },
  "es-es": {
    filter: "Filtrar",
    months: "Meses",
    initialDate: "Fecha inicial",
    finalDate: "Fecha final",
    selectFilter: "Personalizar",
    pickADate: "Elija una fecha",
    close: "Cerrar",
    period: "Periodo",
  },
}

export const PeriodFilter = ({
  dates,
  setDates,
  children,
}: {
  dates: {
    initialDate: Date
    endDate: Date
  }
  setDates: (dates: { initialDate: Date; endDate: Date }) => void
  children?: React.ReactNode
}) => {
  const { locale } = useRouter()
  const content = pageContent[locale as keyof typeof pageContent]
  const local = locale === "en-us" ? enUS : locale === "pt-br" ? ptBR : es

  return (
    <div className="border-border bg-secondary flex w-full flex-wrap gap-5 rounded border-[1px] p-4 pb-0 font-semibold dark:text-white">
      <div className="grid gap-4 pb-4 lg:flex">
        <Label className="grid gap-1">
          {content.initialDate}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dates.initialDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dates.initialDate ? (
                  format(dates.initialDate, "dd/MM/yyyy")
                ) : (
                  <span>{content.pickADate}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dates.initialDate}
                defaultMonth={dates.initialDate}
                locale={local}
                onSelect={(date) => date && setDates({ ...dates, initialDate: date })}
              />
            </PopoverContent>
          </Popover>
        </Label>
        <Label className="grid gap-1">
          {content.finalDate}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dates.endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dates.endDate ? (
                  format(dates.endDate, "dd/MM/yyyy")
                ) : (
                  <span>{content.pickADate}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dates.endDate}
                locale={local}
                defaultMonth={dates.endDate}
                onSelect={(date) => date && setDates({ ...dates, endDate: date })}
              />
            </PopoverContent>
          </Popover>
        </Label>
      </div>
      {children}
    </div>
  )
}
