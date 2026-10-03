import { debounce } from "@/utils/debounce"
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
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/utils/api"

export function UserSearch({
  onUserSelect,
  userId,
}: {
  onUserSelect: (userId: number) => void
  userId?: number
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<null | {
    id: number
    name: string
    lastName: string
  }>(null)

  React.useEffect(() => {
    search(value)
  }, [value])

  React.useEffect(() => {
    if (userId) {
      const find = clients?.find((u) => u.id === userId)
      setSelectedUser({
        id: userId,
        name: find?.name ?? "",
        lastName: find?.lastName ?? "",
      })
    }
    if (!userId) {
      setSelectedUser(null)
      setValue("")
    }
  }, [userId])

  const search = (e: string) => {
    debounce(() => {
      setDebouncedSearch(e)
    }, 400)
  }

  const { data: clients, isLoading } = api.clients.getClients.useQuery(debouncedSearch, {
    keepPreviousData: true,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {selectedUser ? selectedUser?.name : "Select user..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search users..."
            value={value}
            onValueChange={setValue}
          />
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {clients?.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id.toString()}
                    onSelect={(currentValue) => {
                      setSelectedUser({
                        name: client.name!,
                        lastName: client.lastName!,
                        id: client.id,
                      })
                      setValue(currentValue)
                      onUserSelect(Number(currentValue))
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUser?.id === client.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {client.name} {client.lastName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
