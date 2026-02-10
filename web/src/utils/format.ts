// Conversion rates
const AED_TO_USD = 0.2723 // 1 AED ≈ 0.2723 USD
const SQM_TO_SQFT = 10.7639

type Currency = 'AED' | 'USD'
type Unit = 'm²' | 'ft²'

export function formatPrice(amountAED: number | undefined, currency: Currency): string {
  if (amountAED === undefined) return '-'
  const amount = currency === 'USD' ? amountAED * AED_TO_USD : amountAED
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M ${currency}`
  }
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currency}`
}

export function capitalize(value: string | undefined): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatArea(areaSqm: number | undefined, unit: Unit): string {
  if (areaSqm === undefined) return '-'
  const value = unit === 'ft²' ? areaSqm * SQM_TO_SQFT : areaSqm
  return `${Math.round(value).toLocaleString('en-US')} ${unit}`
}
