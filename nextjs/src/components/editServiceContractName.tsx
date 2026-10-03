import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useRouter } from "next/router"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUserRole } from "@/hooks/userUserRole"
import { useState } from "react"
import { api } from "@/utils/api"

const pageContent = {
  "en-us": {
    currentBalance: "Current Balance",
    initialBalance: "Initial Balance",
    checkingAccountBalance: "Checking Account Balance",
    editNameService: "Edit Name Service",
    save: "Save",
  },
  "pt-br": {
    currentBalance: "Saldo Atual",
    initialBalance: "Saldo Inicial",
    checkingAccountBalance: "Saldo em Conta Corrente",
    editNameService: "Editar Nome do Serviço",
    save: "Salvar",
  },
  "es-es": {
    currentBalance: "Saldo Actual",
    initialBalance: "Saldo Inicial",
    checkingAccountBalance: "Saldo en Cuenta Corriente",
    editNameService: "Editar Nombre del Servicio",
    save: "Guardar",
  },
}
export const EditServiceContractName = ({
  service,
}: {
  service: {
    name?: string | null
    nameUserService?: string | null
    id: number
  }
}) => {
  const { locale, query } = useRouter()
  const content = pageContent[locale as keyof typeof pageContent]
  const queryId = Number((query?.id as string) ?? 0)
  const me = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });

  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState(service.nameUserService || service.name)

  const userRole = useUserRole()
  const updateServiceName = api.services.updateServiceName.useMutation({
    onSuccess: () => {
      setIsOpen(false)
    },
  })

  const handleNameSave = (serviceId: number) => () => {
    if (newName) {
      updateServiceName.mutate({
        idService: serviceId,
        name: newName,
      })
      setIsOpen(false)
    }
  }

  if (userRole.userRole !== "client" || (queryId && me.data?.id !== queryId)) return null
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>{content.editNameService}</DialogHeader>
        <div className="space-y-4">
          <Input
            value={newName ?? ""}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={content.editNameService}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleNameSave(service.id)}>{content.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
