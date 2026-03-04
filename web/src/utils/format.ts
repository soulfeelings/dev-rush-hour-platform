import i18n from '../i18n'

// Conversion rates
const AED_TO_USD = 0.2723 // 1 AED ≈ 0.2723 USD
const SQM_TO_SQFT = 10.7639

type Currency = 'AED' | 'USD'
type Unit = 'm²' | 'ft²'

function getLocale(): string {
  switch (i18n.language) {
    case 'ru':
      return 'ru-RU'
    case 'ar':
      return 'ar-SA'
    default:
      return 'en-US'
  }
}

export function formatPrice(amountAED: number | undefined, currency: Currency): string {
  if (amountAED === undefined) return '-'
  const amount = currency === 'USD' ? amountAED * AED_TO_USD : amountAED
  const locale = getLocale()
  const opts: Intl.NumberFormatOptions =
    locale === 'ar-SA'
      ? { maximumFractionDigits: 0, numberingSystem: 'latn' }
      : { maximumFractionDigits: 0 }
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M ${currency}`
  }
  return `${amount.toLocaleString(locale, opts)} ${currency}`
}

export function capitalize(value: string | undefined): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatArea(areaSqft: number | undefined, unit: Unit): string {
  if (areaSqft === undefined) return '-'
  const value = unit === 'm²' ? areaSqft / SQM_TO_SQFT : areaSqft
  const locale = getLocale()
  const opts: Intl.NumberFormatOptions = locale === 'ar-SA' ? { numberingSystem: 'latn' } : {}
  return `${Math.round(value).toLocaleString(locale, opts)} ${unit}`
}
