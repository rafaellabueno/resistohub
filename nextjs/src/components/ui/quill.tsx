import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"

const ReactQuill = dynamic(import("react-quill"), { ssr: false })

const MyQuillComponent = ({ fn }: { fn: (content: string) => void }) => {
  return <></>
}

export default MyQuillComponent
