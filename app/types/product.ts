export interface Product {
  id: number
  name: string
  type: string
  price: number
  discount_price?: number
  images: string[]
  colors?: string[]
  description: string
  features: string[]
  // Backend may provide JSON string/object under options.addons; keep legacy too
  options?: any
  // Selected variant metadata (stored in cart)
  selectedOptions?: Record<string, number>
  selectedImage?: string
}
