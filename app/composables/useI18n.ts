import { ref, computed, watch } from 'vue'

type Locale = 'en' | 'km'

const messages: Record<Locale, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.cart': 'Cart',
    'nav.orders': 'Orders',
    'nav.contact': 'Contact',
    'header.search': 'Search products...',
    'search.noSuggestions': 'No suggestions',
    'header.more': 'More',
    'menu.language': 'Language',
    'menu.eng': 'ENG',
    'menu.kh': 'KH',
    'menu.filter': 'Filter',
    'menu.contact': 'Contact',
    'menu.partners': 'Our Partners',
    'empty.noProducts': 'No products found matching your criteria.',
    'promo.title': 'Special Offer',
    'promo.desc': 'Get 20% off on your first purchase. Limited time only!',
    'promo.cta': 'Shop Now',
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.features': 'Features',
    'product.type': 'Type',
    'product.option': 'Option',
    'product.availableColors': 'Available Colors',
    'general.productNotFound': 'Product not found.',
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyCta': 'Add some products to get started!',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.buyNow': 'Buy Now',
    'cart.addedCount': '~ {count} products',
  },
  km: {
    'nav.home': 'ទំព័រដើម',
    'nav.cart': 'រទេះទំនិញ',
    'nav.orders': 'ការកម្មង់',
    'nav.contact': 'ទំនាក់ទំនង',
    'header.search': 'ស្វែងរកទំនិញ...',
    'search.noSuggestions': 'មិនមានការណែនាំ',
    'header.more': 'ផ្សេងៗ',
    'menu.language': 'ភាសា',
    'menu.eng': 'អង់គ្លេស',
    'menu.kh': 'ខ្មែរ',
    'menu.filter': 'តម្រៀប',
    'menu.contact': 'ទំនាក់ទំនង',
    'menu.partners': 'ដៃគូររបស់យើង',
    'empty.noProducts': 'រកមិនឃើញទំនិញតាមលក្ខខណ្ឌរបស់អ្នកទេ។',
    'promo.title': 'ការផ្តល់ជូនពិសេស',
    'promo.desc': 'ទទួលបានបញ្ចុះតម្លៃ ២០% សម្រាប់ការទិញលើកដំបូង។ កំណត់ពេល!',
    'promo.cta': 'ទិញឥឡូវនេះ',
    'product.addToCart': 'បញ្ចូលរទេះ',
    'product.buyNow': 'ទិញឥឡូវនេះ',
    'product.features': 'លក្ខណៈពិសេស',
    'product.type': 'ប្រភេទ',
    'product.option': 'ជម្រើស',
    'product.availableColors': 'ពណ៌ដែលមាន',
    'general.productNotFound': 'រកមិនឃើញទំនិញទេ។',
    'cart.title': 'រទេះទំនិញ',
    'cart.empty': 'រទេះទំនិញរបស់អ្នកទទេ',
    'cart.emptyCta': 'បន្ថែមផលិតផលមួយចំនួនដើម្បីចាប់ផ្តើម!',
    'cart.subtotal': 'សរុបរង',
    'cart.shipping': 'ដឹកជញ្ជូន',
    'cart.tax': 'ពន្ធ',
    'cart.total': 'សរុប',
    'cart.checkout': 'បន្តទូទាត់',
    'cart.buyNow': 'ទិញឥឡូវនេះ',
    'cart.addedCount': '~ {count} ផលិតផល',
  }
}

const isClient = typeof window !== 'undefined'
const saved = isClient ? (window.localStorage.getItem('locale') as Locale | null) : null
const localeRef = ref<Locale>(saved || 'km')

watch(localeRef, (val) => {
  if (isClient) window.localStorage.setItem('locale', val)
})

export function useI18n() {
  const locale = localeRef
  const t = (key: string) => messages[locale.value]?.[key] ?? key
  const isEn = computed(() => locale.value === 'en')
  const isKm = computed(() => locale.value === 'km')
  const setLocale = (l: Locale) => (locale.value = l)
  return { locale, t, isEn, isKm, setLocale }
}
