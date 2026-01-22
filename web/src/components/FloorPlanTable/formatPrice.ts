export const formatPrice = (amount: number | undefined, currency: string | undefined) => {
  if (amount === undefined) return { value: '-', currency: '' }
  const currencySymbol = currency || 'AED'
  return {
    value: `${(amount / 1000000).toFixed(1)}M`,
    currency: currencySymbol,
  }
}
