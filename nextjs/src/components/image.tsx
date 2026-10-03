import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { clientContent } from "@/language/client"
import { api } from "@/utils/api"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/router"
import React from "react"

const toBase64 = async (file: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export const uploadImage = async (src: string, token: string) => {
  const file = await fetch(src).then((r) => r.blob())
  const base64 = (await toBase64(file)) as string
  const { locale } = useRouter()
  const { account: content } = clientContent[locale as keyof typeof clientContent]
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_CPX_LINK}/api/sites/save-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image: base64,
      }),
    },
  ).catch(() => {
    throw new Error(content.errorImage)
  })

  return ((await data.json()) as { imageName: string })?.imageName
}

export const ImageUploader = React.forwardRef<
  HTMLImageElement,
  {
    defaultImagLink?: string | undefined | null
    token?: string | null | undefined
    handleRemove?: () => void
  }
>(function Uploader(
  props: {
    defaultImagLink?: string | undefined | null
    token?: string | null | undefined
    handleRemove?: () => void
  },
  ref: React.Ref<HTMLImageElement>,
) {
  const hasRemoved = React.useRef(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const loading = React.useRef(false)
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // biome-ignore lint/complexity/useOptionalChain: <explanation>
    if (event.target.files && event.target.files[0]) {
      hasRemoved.current = false
      const img = event.target.files[0]
      setSelectedImage(URL.createObjectURL(img))
    }
  }

  const { locale } = useRouter()
  const { account: content } = clientContent[locale as keyof typeof clientContent]

  const { toast } = useToast()
  const updatePhoto = api.image.updatePhoto.useMutation({
    onSuccess: () => {
      toast({
        title: content.success,
      })
    },
  })

  const fetchImage = React.useCallback(
    async (token: string) => {
      if (!props.defaultImagLink || props.defaultImagLink === "") return
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_CPX_LINK}/api/sites/show-image/${props.defaultImagLink}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      // if image has +xml in the end, it's a svg
      if (props.defaultImagLink?.includes("svg+xml")) {
        const data = await response.text()
        const blob = new Blob([data], { type: "image/svg+xml" })
        const base64 = (await toBase64(blob)) as string
        setSelectedImage(base64)
        loading.current = false
        return
      }
      const file = await response.blob()

      const base64 = (await toBase64(file)) as string
      setSelectedImage(base64)
      loading.current = false
    },
    [props.defaultImagLink],
  )

  const handleRemove = () => {
    setSelectedImage(null)
    hasRemoved.current = true
    // biome-ignore lint/complexity/useOptionalChain: <explanation>
    props.handleRemove && props.handleRemove()
    deletePhoto.mutate()
  }

  const deletePhoto = api.image.deleteImage.useMutation({
    onSuccess: () => {
      toast({
        title: content.imageRemoved,
      })
    },
  })

  const saveImage = () => {
    props.token &&
      selectedImage &&
      uploadImage(selectedImage, props.token).then((data) => {
        updatePhoto.mutate({ photo: data })
      })
  }

  React.useEffect(() => {
    if (
      props.defaultImagLink &&
      props.token &&
      !selectedImage &&
      !loading.current &&
      !hasRemoved.current
    ) {
      loading.current = true
      ;(async () => {
        props.token && (await fetchImage(props?.token))
      })().catch(() => {
        loading.current = false
      })
    }
  }, [fetchImage, props, selectedImage])

  return (
    <div className="py-5">
      <label
        htmlFor="file"
        className="mb-5 ml-auto flex h-12 w-12 items-center justify-center rounded-lg  bg-background"
      >
        <input
          type="file"
          id="file"
          accept="image/*"
          className="h-0 w-0 opacity-0"
          multiple={false}
          onChange={onImageChange}
        />
        <PencilIcon className="text-lg" />
      </label>

      <img
        ref={ref}
        // placeholder="blur"
        src={selectedImage ?? ""}
        alt="Imagem selecionada"
        className={
          selectedImage
            ? "mx-auto  h-60 w-60 rounded-full border border-black object-cover object-top dark:border-white"
            : "hidden"
        }
      />

      <div className="mt-5 flex justify-end gap-5 ">
        <Button
          className=""
          onClick={saveImage}
          disabled={updatePhoto.isLoading}
          loading={updatePhoto.isLoading}
        >
          {content.save}
        </Button>
        <Button
          onClick={handleRemove}
          disabled={deletePhoto.isLoading}
          loading={deletePhoto.isLoading}
        >
          <Trash2Icon className="mr-2 w-4" />
          {content.remove}
        </Button>
      </div>
    </div>
  )
})
