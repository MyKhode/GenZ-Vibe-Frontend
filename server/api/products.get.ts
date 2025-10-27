import { defineEventHandler, getQuery } from 'h3'

interface Product {
  id: number
  name: string
  type: string
  price: number
  images: string[]
  colors: string[]
  description: string
  features: string[]
  options?: string[]
  // localized fields
  nameKm?: string
  descriptionKm?: string
  featuresKm?: string[]
  optionsKm?: string[]
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'BS-90W Using Bluetooth 2.5Hz',
    nameKm: 'កាស BS-90W Bluetooth 2.5Hz',
    type: 'Wireless',
    price: 169.99,
    images: ['/images/bs90w.png', 'https://www.igearworld.com/cdn/shop/files/kv.png?v=1723114365'],
    colors: ['white', 'pink', 'yellow'],
    description:
      'Play like a legend with a headset designed for performance PC gaming. Immersive HQ audio, the best mic in gaming, and sleek side-facing!',
    descriptionKm:
      'លេងដូចជាតារា ជាមួយកាសដែលរចនាឡើងសម្រាប់ហ្គេមកុំព្យូទ័រដោយផ្តោតលើសមត្ថភាព។ សម្លេងល្អ និងរចនាបែបទំនើប!',
    features: [
      'Wireless connectivity',
      'Premium audio quality',
      'Comfortable design',
    ],
    featuresKm: [
      'តភ្ជាប់ឥតខ្សែ',
      'សម្លេងគុណភាពខ្ពស់',
      'រចនាសមស្រប',
    ],
    options: ['Standard', 'Limited Edition'],
    optionsKm: ['ស្តង់ដារ', 'កំណែពិសេស'],
  },
  {
    id: 2,
    name: 'G733 Lightspeed',
    nameKm: 'G733 ល្បឿនខ្ពស់',
    type: 'Wireless',
    price: 119.0,
    images: ['/images/bs90w.png', '/images/bs90w.png', '/images/bs90w.png', '/images/bs90w.png'],
    colors: ['blue', 'white'],
    description:
      'Lightweight wireless gaming headset with advanced audio and customizable LIGHTSYNC RGB lighting.',
    descriptionKm:
      'កាសហ្គេមឥតខ្សែ ទំងន់ស្រាល មានសម្លេងល្អ និងភ្លើង LIGHTSYNC RGB ដែលកែតម្រូវបាន។',
    features: ['Ultra-lightweight design', 'LIGHTSYNC RGB', 'Pro-G drivers', '29-hour battery life'],
    featuresKm: ['ទំងន់ស្រាល', 'ភ្លើង LIGHTSYNC RGB', 'ឧបករណ៍បន្ទះ Pro-G', 'ថាមពលអស់រយៈពេល 29 ម៉ោង'],
    options: ['Black', 'White'],
    optionsKm: ['ខ្មៅ', 'ស'],
  },
]

export default defineEventHandler((event) => {
  const { search = '', limit } = getQuery(event) as { search?: string; limit?: string }
  const q = (search || '').toString().trim().toLowerCase()

  let result = MOCK_PRODUCTS

  if (q) {
    result = result.filter((p) =>
      [p.name, p.type, p.description].some((v) => v.toLowerCase().includes(q))
    )
  }

  if (limit) {
    const n = Number(limit)
    if (!Number.isNaN(n)) {
      result = result.slice(0, n)
    }
  }

  return { items: result }
})
