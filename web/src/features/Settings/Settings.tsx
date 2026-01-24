import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ModalBody } from '../../ui/Modal/Modal'
import { Button, Typography } from '../../ui'
import styles from './Settings.module.scss'
import ukFlag from '@assets/uk.svg'

// TODO: Add other languages and currencies and units when backend will be ready for this

const Language = {
  EN: 'en',
} as const
type Language = (typeof Language)[keyof typeof Language]

const Currency = {
  AED: 'AED',
  // USD: 'USD',
  // EUR: 'EUR',
  // RUB: 'RUB',
  // CNY: 'CNY',
} as const
type Currency = (typeof Currency)[keyof typeof Currency]

const Unit = {
  // M2: 'm²',
  FT2: 'ft²',
} as const
type Unit = (typeof Unit)[keyof typeof Unit]

const LANGUAGES = Object.values(Language)
const CURRENCIES = Object.values(Currency)
const UNITS = Object.values(Unit)

const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.EN]: 'settings.languages.english',
}

const UNIT_LABELS: Record<Unit, string> = {
  // [Unit.M2]: 'settings.units.squareMeters',
  [Unit.FT2]: 'settings.units.squareFeet',
}

interface SettingsProps {
  open: boolean
  onClose: () => void
}

export const Settings = ({ open, onClose }: SettingsProps) => {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<Language>(Language.EN)
  const [currency, setCurrency] = useState<Currency>(Currency.AED)
  const [unit, setUnit] = useState<Unit>(Unit.FT2)

  const handleLanguageChange = useCallback(
    (lang: Language) => () => {
      setLanguage(lang)
    },
    []
  )

  const handleCurrencyChange = useCallback(
    (curr: Currency) => () => {
      setCurrency(curr)
    },
    []
  )

  const handleUnitChange = useCallback(
    (u: Unit) => () => {
      setUnit(u)
    },
    []
  )

  const languageButtons = useMemo(
    () =>
      LANGUAGES.map(lang => (
        <Button
          key={lang}
          variant={language === lang ? 'primary' : 'secondary'}
          size="sm"
          iconLeft={<img src={ukFlag} alt="UK Flag" />}
          selected={language === lang}
          onClick={handleLanguageChange(lang)}
        >
          {t(LANGUAGE_LABELS[lang])}
        </Button>
      )),
    [language, handleLanguageChange, t]
  )

  const currencyButtons = useMemo(
    () =>
      CURRENCIES.map(curr => (
        <Button
          key={curr}
          variant={currency === curr ? 'primary' : 'secondary'}
          size="sm"
          selected={currency === curr}
          onClick={handleCurrencyChange(curr)}
        >
          {curr}
        </Button>
      )),
    [currency, handleCurrencyChange]
  )

  const unitButtons = useMemo(
    () =>
      UNITS.map(u => (
        <Button
          key={u}
          variant={unit === u ? 'primary' : 'secondary'}
          size="sm"
          selected={unit === u}
          onClick={handleUnitChange(u)}
        >
          {t(UNIT_LABELS[u])}
        </Button>
      )),
    [unit, handleUnitChange, t]
  )

  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')}>
      <ModalBody>
        <div className={styles.section}>
          <Typography
            as="h3"
            variant="body"
            size="large"
            weight="medium"
            className={styles.sectionTitle}
          >
            {t('settings.language')}
          </Typography>
          <div className={styles.options}>{languageButtons}</div>
        </div>

        <div className={styles.section}>
          <Typography
            as="h3"
            variant="body"
            size="large"
            weight="medium"
            className={styles.sectionTitle}
          >
            {t('settings.currency')}
          </Typography>
          <div className={styles.options}>{currencyButtons}</div>
        </div>

        <div className={styles.section}>
          <Typography
            as="h3"
            variant="body"
            size="large"
            weight="medium"
            className={styles.sectionTitle}
          >
            {t('settings.units')}
          </Typography>
          <div className={styles.options}>{unitButtons}</div>
        </div>
      </ModalBody>
    </Modal>
  )
}
