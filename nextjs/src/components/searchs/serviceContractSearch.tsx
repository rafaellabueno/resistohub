import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import React from "react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { ChevronsUpDown, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/utils/api"

export function ServiceContractSearch({
  onServiceSelect,
  serviceContractId,
  serviceId,
  userId,
}: {
  onServiceSelect: (serviceId: number) => void
  serviceContractId?: number
  serviceId?: number
  userId: number
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [selectedService, setSelectedService] = React.useState<null | {
    id: number
    name: string
  }>(null)

  React.useEffect(() => {
    if (serviceContractId) {
      setSelectedService({
        id: serviceContractId,
        name: services?.find((s) => s.id === serviceContractId)?.initialValue ?? "",
      })
    }
    if (!serviceContractId) {
      setSelectedService(null)
      setValue("")
    }
  }, [serviceContractId])

  const { data: services, isLoading } = api.services.getUserServiceContracts.useQuery(
    userId,
    {
      keepPreviousData: true,
    },
  )

  const filteredServices = serviceId
    ? services?.filter((s) => s.idServices === serviceId)
    : services

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedService ? selectedService?.id : "Select service..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search services..."
            value={value}
            onValueChange={setValue}
          />
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <ScrollArea className="h-80 overflow-auto">
                <CommandEmpty>No service found.</CommandEmpty>
                <CommandGroup>
                  {filteredServices?.map((service) => (
                    <CommandItem
                      key={service.id}
                      value={`${service.initialValue}${service.parentId ?? service.id}`}
                      onSelect={(currentValue) => {
                        setSelectedService({
                          name: Number(service.initialValue).toString()!,
                          id: service.id,
                        })
                        setValue(currentValue)
                        onServiceSelect(Number(service.id))
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedService?.id === service.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {Number(service.initialValue)} ({service.id})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
