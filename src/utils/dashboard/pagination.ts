export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), Math.max(1, totalPages))
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function buildPageNumbers(page: number, totalPages: number, radius = 2): number[] {
  const out: number[] = []
  const start = Math.max(1, page - radius)
  const end = Math.min(totalPages, page + radius)
  for (let p = start; p <= end; p++) out.push(p)
  return out
}

