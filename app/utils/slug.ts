export const toSlug = (text: string) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const matchBySlug = <T extends { name: string }>(items: T[], slug: string) => {
  return items.find((i) => toSlug(i.name) === slug)
}

