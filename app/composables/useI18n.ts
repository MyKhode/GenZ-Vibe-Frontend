import { ref, computed, watch } from 'vue'

export type Locale = 'en' | 'km'

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
    // OTP / Auth
    'otp.payAndLogin': 'Pay • Login by Phone',
    'otp.enterCode': 'Enter the 6-digit code sent to your phone',
    'otp.codePlaceholder': '123456',
    'otp.verify': 'Verify Code',
    'otp.verifying': 'Verifying... ',
    'otp.resend': 'Resend',
    'otp.sending': 'Sending... ',
    'otp.sent': 'OTP sent!',
    'otp.verified': 'Phone number verified and logged in!',
    'otp.verifyFailed': 'Verification failed. Please check the code.',
    'otp.sendFailed': 'Failed to send OTP. Try again.',
    'otp.noSession': 'No OTP session found. Please resend the code.',
    'otp.phoneRequired': 'Please enter your phone number first.',
    'otp.firebaseNotReady': 'Firebase not loaded yet. Please wait and try again.',
    // Checkout
    'checkout.buyerInfo': 'Buyer Information',
    'checkout.name': 'Full Name',
    'checkout.phone': 'Phone Number',
    'checkout.delivery': 'Delivery Address',
    'checkout.fullAddress': 'Full Address',
    'checkout.province': 'Province',
    'checkout.note': 'Note to Seller',
    'checkout.payment': 'Payment Method',
    'checkout.bakongKhqr': 'Bakong KHQR',
    'checkout.khqrDesc': 'Pay securely by scanning the KHQR code.',
    'checkout.khqrNote': 'We will generate a KHQR for the total amount on confirm.',
    'checkout.khqrPlaceholder': 'KHQR preview will appear here',
    'checkout.fillRequired': 'Please fill in all required fields (name, phone, address, province).',
    'checkout.submitted': 'Checkout details submitted. (Demo action)',
    'checkout.namePlaceholder': 'John Doe',
    'checkout.phonePlaceholder': '+855 12 345 678',
    'checkout.addressPlaceholder': 'House No, Street, Sangkat, Khan',
    'checkout.provincePlaceholder': 'Select province',
    'checkout.notePlaceholder': 'Any delivery notes for the seller',
    // Themes
    'themes.title': 'Download Themes',
    'themes.description': 'Browse and download ready-to-use UI themes and widgets.',
    'themes.all': 'All',
    'themes.downloading': 'Downloading... ',
    'themes.download': 'Download',
    'themes.downloadSuccess': 'Downloaded {name} successfully!',
    'themes.downloadFailed': 'Failed to download theme.',
    'themes.noThemes': 'No Themes Found',
    'themes.noThemesMessage': 'Try a different category or check back later.'
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
    // OTP / Auth
    'otp.payAndLogin': 'បង់ប្រាក់ • ចូលដោយលេខទូរស័ព្ទ',
    'otp.enterCode': 'បញ្ចូលលេខកូដ ៦ ខ្ទង់ ដែលបានផ្ញើទៅទូរស័ព្ទរបស់អ្នក',
    'otp.codePlaceholder': '123456',
    'otp.verify': 'ផ្ទៀងផ្ទាត់កូដ',
    'otp.verifying': 'កំពុងផ្ទៀងផ្ទាត់...',
    'otp.resend': 'ផ្ញើម្ដងទៀត',
    'otp.sending': 'កំពុងផ្ញើ...',
    'otp.sent': 'បានផ្ញើ OTP!',
    'otp.verified': 'បានផ្ទៀងផ្ទាត់លេខទូរស័ព្ទ និងចូលស្វ័យប្រវត្តិ!',
    'otp.verifyFailed': 'ផ្ទៀងផ្ទាត់បរាជ័យ។ សូមពិនិត្យកូដម្តងទៀត។',
    'otp.sendFailed': 'ផ្ញើ OTP មិនបានសម្រេច។ សូមសាកល្បងម្ដងទៀត។',
    'otp.noSession': 'រកមិនឃើញសម័យ OTP។ សូមផ្ញើកូដម្ដងទៀត។',
    'otp.phoneRequired': 'សូមបញ្ចូលលេខទូរស័ព្ទជាមុនសិន។',
    'otp.firebaseNotReady': 'Firebase មិនទាន់ផ្ទុក xong ទេ។ សូមរង់ចាំហើយព្យាយាមម្ដងទៀត។',
    // Checkout
    'checkout.buyerInfo': 'ព័ត៌មានអ្នកទិញ',
    'checkout.name': 'ឈ្មោះពេញ',
    'checkout.phone': 'លេខទូរស័ព្ទ',
    'checkout.delivery': 'អាសយដ្ឋានដឹកជញ្ជូន',
    'checkout.fullAddress': 'អាសយដ្ឋានពេញ',
    'checkout.province': 'ខេត្ដ/ខេត្ត',
    'checkout.note': 'កំណត់ចំណាំទៅអ្នកលក់',
    'checkout.payment': 'វិធីបង់ប្រាក់',
    'checkout.bakongKhqr': 'បាគុង KHQR',
    'checkout.khqrDesc': 'បង់ប្រាក់ដោយសុវត្ថិភាពតាមការ​ស្កេន KHQR។',
    'checkout.khqrNote': 'យើងនឹងបង្កើត KHQR សម្រាប់ចំនួនសរុបពេលបញ្ជាក់។',
    'checkout.khqrPlaceholder': 'រូបភាព KHQR នឹងបង្ហាញទីនេះ',
    'checkout.fillRequired': 'សូមបំពេញព័ត៌មានចាំបាច់ (ឈ្មោះ លេខទូរស័ព្ទ អាសយដ្ឋាន ខេត្ត/ក្រុង)។',
    'checkout.submitted': 'បានបញ្ជូនព័ត៌មានទូទាត់ (សាកល្បង)',
    'checkout.namePlaceholder': 'ស៊ុន សុខា',
    'checkout.phonePlaceholder': '+855 12 345 678',
    'checkout.addressPlaceholder': 'ផ្ទះ លេខ ផ្លូវ សង្កាត់ ខណ្ឌ',
    'checkout.provincePlaceholder': 'ជ្រើសរើសខេត្ត/ក្រុង',
    'checkout.notePlaceholder': 'កំណត់ចំណាំការដឹកជញ្ជូនទៅអ្នកលក់',
    // Themes
    'themes.title': 'ទាញយកស្បែក UI',
    'themes.description': 'រកមើល និងទាញយកស្បែក UI និងវិដជិតស្រេចប្រើ។',
    'themes.all': 'ទាំងអស់',
    'themes.downloading': 'កំពុងទាញយក...',
    'themes.download': 'ទាញយក',
    'themes.downloadSuccess': 'ទាញយក {name} បានជោគជ័យ!',
    'themes.downloadFailed': 'ទាញយកស្បែកបរាជ័យ។',
    'themes.noThemes': 'មិនមានស្បែក',
    'themes.noThemesMessage': 'សូមសាកល្បងប្រភេទផ្សេង ឬត្រឡប់មកពេលក្រោយ។'
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
  const toggleLanguage = () => {
    locale.value = locale.value === 'en' ? 'km' : 'en'
  }
  return { locale, t, isEn, isKm, setLocale, toggleLanguage }
}
