import { useRouter } from "next/router"
import { clientContent } from "@/language/client"
import Link from "next/link"

export const LinksDeposits = () => {
  const { locale, asPath, query } = useRouter()
  const { deposits } = clientContent[locale as keyof typeof clientContent]
  const links = [
    {
      name: `${deposits.histMov}`,
      href: "/history-moviments",
    },
    {
      name: `${deposits.histAssets}`,
      href: "/history-assets",
    },
  ]
  const linkClient = query?.id ? `/${query.id}` : ""

  return (
    <div className="border-border bg-secondary my-5 grid w-full items-center gap-2 rounded border-[1px] p-3 font-semibold text-[#858383] dark:text-white lg:grid-cols-2">
      {links.map((link) => (
        <Link key={link.href} href={`${link.href}${linkClient}`}>
          <div
            className={`rounded p-4 text-center duration-100${
              asPath === link.href
                ? "bg-[#3cbbd2] hover:bg-[#3cbbd2] hover:text-white dark:bg-[#3cbbd2] dark:hover:bg-[#3cbbd2]"
                : "border-border bg-background rounded border-[1px] p-4 text-center duration-100 hover:bg-[#3cbbd2] hover:text-white focus:bg-[#3cbbd2] focus:text-white dark:hover:bg-[#3cbbd2] dark:focus:bg-[#3cbbd2]"
            }`}
          >
            {link.name}
          </div>
        </Link>
      ))}
    </div>
  )
}
