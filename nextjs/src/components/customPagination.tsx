import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
const splicePages = (pages: number, offset: number) => {
  const pagesArray = Array.from(Array(pages).keys())
  if (pages < 3) return pagesArray
  if (offset === 0) return pagesArray.splice(0, 3)
  if (offset === pages - 1) return pagesArray.splice(offset - 2, 3)
  return pagesArray.splice(offset - 1, 3)
}

const showFirstPage = (offset: number) => {
  if (offset < 2) return false
  return true
}

const showLastPage = (pages: number, offset: number) => {
  if (offset > pages - 3) return false
  return true
}

export const CustomPagination = (props: {
  page: number
  pages: number
  href: string
}) => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={`${props.href}=${props.page}`} />
        </PaginationItem>
        {showFirstPage(props.page) ? (
          <>
            <PaginationItem>
              <PaginationLink href={`${props.href}=1`}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        ) : null}

        {splicePages(props.pages, props.page).map((i) => (
          <PaginationItem>
            <PaginationLink href={`${props.href}=${i + 1}`} isActive={i === props.page}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showLastPage(props.pages, props.page) ? (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`${props.href}=${props.pages}`}>
                {props.pages}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : null}
        <PaginationItem>
          <PaginationNext href={`${props.href}=${props.page + 2}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
