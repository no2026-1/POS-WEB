import { useState } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
}

export function usePagination({ initialPage = 1, initialLimit = 20 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  function goToPage(p: number) {
    setPage(p)
  }

  function nextPage() {
    setPage((p) => p + 1)
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1))
  }

  function reset() {
    setPage(initialPage)
  }

  return { page, limit, setPage, setLimit, goToPage, nextPage, prevPage, reset }
}
