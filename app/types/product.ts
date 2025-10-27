export interface Product {
  id: number
  name: string
  type: string
  price: number
  images: string[]
  colors: string[]
  description: string
  features: string[]
  options?: string[]
}
