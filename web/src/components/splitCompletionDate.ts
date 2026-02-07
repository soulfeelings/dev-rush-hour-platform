const defaultResult = {
  firstPart: '',
  rest: '',
}

export const splitCompletionDate = (dateString: string | undefined) => {
  if (!dateString) {
    return defaultResult
  }

  // Проверяем формат YYYY-MM (новый формат)
  const yyyyMmMatch = dateString.match(/^(\d{4})-(\d{2})$/)
  if (yyyyMmMatch) {
    const year = yyyyMmMatch[1]
    const month = parseInt(yyyyMmMatch[2], 10)

    // Определяем квартал по месяцу
    let quarter = ''
    if (month >= 1 && month <= 3) {
      quarter = 'Q1'
    } else if (month >= 4 && month <= 6) {
      quarter = 'Q2'
    } else if (month >= 7 && month <= 9) {
      quarter = 'Q3'
    } else if (month >= 10 && month <= 12) {
      quarter = 'Q4'
    }

    return {
      firstPart: quarter,
      rest: year,
    }
  }

  // Если формат не распознан, возвращаем пустые значения
  return defaultResult
}
