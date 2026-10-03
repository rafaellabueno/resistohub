import { useState } from "react"

import { Files } from "lucide-react"
import { useRouter } from "next/router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
export const SignedAgreementDialog = () => {
  const pageContent = {
    "en-us": {
      registerNewProduct: "Register new service",
      productName: "Service Name",
      serviceType: "Service Type",
      periodicity: "Periodicity",
      startDate: "Start Date",
      contractRate: "Contract Rate",
      terminationFine: "Termination Fine",
      finiteOrInfinite: "Finite or Infinite",
      test: "Test",
      dayMonthYear: "Day, Month, Year",
      endDate: "End Date",
      closingRate: "Closing Rate",
      profitFine: "Profit Fine",
      distribution: "Distribution",
      notes: "Notes",
      save: "Save",
      signedAgreement: "Signed agreement",
    },
    "pt-br": {
      registerNewProduct: "Cadastrar novo serviço",
      productName: "Nome do serviço",
      serviceType: "Tipo de serviço",
      periodicity: "Periodicidade",
      startDate: "Data de início",
      contractRate: "Taxa de contratação",
      terminationFine: "Multa rescisória",
      finiteOrInfinite: "Finito ou infinito",
      test: "Teste",
      dayMonthYear: "Dia, mês, ano",
      endDate: "Data de término",
      closingRate: "Taxa de encerramento",
      profitFine: "Multa sobre ganhos",
      distribution: "Distribuição",
      notes: "Observações",
      save: "Salvar",
      signedAgreement: "Termo assinado",
    },
    "es-es": {
      registerNewProduct: "Registrar nuevo servicio",
      productName: "Nombre del servicio",
      serviceType: "Tipo de servicio",
      periodicity: "Periodicidad",
      startDate: "Fecha de inicio",
      contractRate: "Tasa de contrato",
      terminationFine: "Multa por terminación",
      finiteOrInfinite: "Finito o infinito",
      test: "Prueba",
      dayMonthYear: "Día, mes, año",
      endDate: "Fecha de terminación",
      closingRate: "Tasa de cierre",
      profitFine: "Multa sobre ganancias",
      distribution: "Distribución",
      notes: "Observaciones",
      save: "Guardar",
      signedAgreement: "Acuerdo firmado",
    },
  }
  const { locale } = useRouter()
  const content = pageContent[locale as keyof typeof pageContent]
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex w-full items-center gap-2 text-gray-800 duration-300 dark:text-[#fff] "
        asChild
      >
        <button className="mx-auto w-full justify-center font-bold uppercase">
          <Files />
          {content.signedAgreement}
        </button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-2">
        <DialogHeader className="mt-3">
          <DialogTitle className=" border-b border-zinc-600 text-lg font-extrabold dark:border-zinc-300">
            {content.signedAgreement}
          </DialogTitle>
        </DialogHeader>
        <p>IP: 111111111</p>
        <p>01/03/2023 - 20:24:10</p>
      </DialogContent>
    </Dialog>
  )
}
