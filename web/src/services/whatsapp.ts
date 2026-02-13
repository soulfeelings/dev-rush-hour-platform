const PHONE = '971544313048'

export function openWhatsApp(text: string) {
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank')
}
