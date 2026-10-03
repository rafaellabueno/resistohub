import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export const months = {
  "en-us": {
    months: [
      {
        month: "January",
        number: 0,
      },
      {
        month: "February",
        number: 1,
      },
      {
        month: "March",
        number: 2,
      },
      {
        month: "April",
        number: 3,
      },
      {
        month: "May",
        number: 4,
      },
      {
        month: "June",
        number: 5,
      },
      {
        month: "July",
        number: 6,
      },
      {
        month: "August",
        number: 7,
      },
      {
        month: "September",
        number: 8,
      },
      {
        month: "October",
        number: 9,
      },
      {
        month: "November",
        number: 10,
      },
      {
        month: "December",
        number: 11,
      },
    ],
  },
  "pt-br": {
    months: [
      {
        month: "Janeiro",
        number: 0,
      },
      {
        month: "Fevereiro",
        number: 1,
      },
      {
        month: "Março",
        number: 2,
      },
      {
        month: "Abril",
        number: 3,
      },
      {
        month: "Maio",
        number: 4,
      },
      {
        month: "Junho",
        number: 5,
      },
      {
        month: "Julho",
        number: 6,
      },
      {
        month: "Agosto",
        number: 7,
      },
      {
        month: "Setembro",
        number: 8,
      },
      {
        month: "Outubro",
        number: 9,
      },
      {
        month: "Novembro",
        number: 10,
      },
      {
        month: "Dezembro",
        number: 11,
      },
    ],
  },

  "es-es": {
    months: [
      {
        month: "Enero",
        number: 0,
      },
      {
        month: "Febrero",
        number: 1,
      },
      {
        month: "Marzo",
        number: 2,
      },
      {
        month: "Abril",
        number: 3,
      },
      {
        month: "Mayo",
        number: 4,
      },
      {
        month: "Junio",
        number: 5,
      },
      {
        month: "Julio",
        number: 6,
      },
      {
        month: "Agosto",
        number: 7,
      },
      {
        month: "Septiembre",
        number: 8,
      },
      {
        month: "Octubre",
        number: 9,
      },
      {
        month: "Noviembre",
        number: 10,
      },
      {
        month: "Diciembre",
        number: 11,
      },
    ],
  },
}

const pageContent = {
  "en-us": {
    title: "Trades",
    return: "Return",
    filter: "Filter",
    editRegistration: "Edit registration",
    selectYear: "Select a year",
    findYear: "Find a year",
    noYears: "No years found",
    allMonths: "All months",
    selectMonth: "Select a month",
    findMonth: "Find a month",
    noMonths: "No months found",
  },
  "pt-br": {
    title: "Trades",
    return: "Voltar",
    filter: "Filtrar",
    editRegistration: "Editar cadastro",
    selectYear: "Selecione um ano",
    findYear: "Procure pelo ano",
    noYears: "Nenhum ano encontrado",
    allMonths: "Todos os meses",
    selectMonth: "Selecione um mês",
    findMonth: "Procure pelo mês",
    noMonths: "Nenhum mês encontrado",
  },

  "es-es": {
    title: "Trades",
    return: "Volver",
    filter: "Filtrar",
    editRegistration: "Editar registro",
    selectYear: "Seleccione un año",
    findYear: "Buscar un año",
    noYears: "No se encontraron años",
    allMonths: "Todos los meses",
    selectMonth: "Seleccione un mes",
    findMonth: "Buscar un mes",
    noMonths: "No se encontraron meses",
  },
}

const years = Array.from({ length: new Date().getFullYear() - 2017 }, (_, i) =>
  String(new Date().getFullYear() - i),
)

export const SelectMonth = ({
  value,
  onValueChange,
  monthsOptionBoolean,
}: {
  value: number
  onValueChange: (n: number) => void
  monthsOptionBoolean: boolean
}) => {
  const { locale } = useRouter()
  const content = pageContent[locale as keyof typeof pageContent]
  const allMonths = months[locale as keyof typeof months].months

  let monthOptions = allMonths
  if (monthsOptionBoolean) {
    const allMonthsOption = {
      month: content.allMonths,
      number: -1,
    }
    monthOptions = [allMonthsOption, ...allMonths]
  }
  const [open, setOpen] = useState(false)

  // Função auxiliar para encontrar o mês atual baseado no valor numérico
  const getCurrentMonth = () => {
    const currentMonth = monthOptions.find((m) => m.number === value)
    return currentMonth ? currentMonth.month : content.selectMonth
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-fit min-w-[160px] max-w-[200px] px-3 justify-between"
          aria-expanded={open}
        >
          <span className="truncate">{getCurrentMonth()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={content.findMonth} />
          <CommandEmpty>{content.noMonths}</CommandEmpty>
          <CommandGroup className="max-h-40">
            {monthOptions.map((m) => (
              <CommandItem
                key={m.month}
                value={m.month}
                onSelect={() => {
                  onValueChange(m.number)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    m.number === value ? "opacity-100" : "opacity-0",
                  )}
                />
                {m.month}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const SelectYear = ({
  value,
  onValueChange,
}: {
  value: number
  onValueChange: (year: number) => void
}) => {
  const [open, setOpen] = useState(false)
  const { locale } = useRouter()
  const content = pageContent[locale as keyof typeof pageContent]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
          aria-expanded={open}
        >
          {value ? String(value) : content.selectYear}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={content.findYear} />
          <CommandEmpty>{content.noYears}</CommandEmpty>
          <CommandGroup className="max-h-40">
            {years.map((year) => (
              <CommandItem
                key={year}
                value={year}
                onSelect={(currentValue) => {
                  onValueChange(Number(currentValue))
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    String(value) === year ? "opacity-100" : "opacity-0",
                  )}
                />
                {year}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
