import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ModalBody } from '../../ui/Modal/Modal'
import { Button } from '../../ui'
import styles from './Settings.module.scss'

type Language = 'ar' | 'en' | 'ru'
type Currency = 'AED' | 'USD' | 'EUR' | 'RUB' | 'CNY'
type Unit = 'm²' | 'ft²'

interface SettingsProps {
  open: boolean
  onClose: () => void
}

const UAEFlag = () => (
  <div className={styles.uaeflag}>
    <div className={styles.flagBlack}></div>
    <div className={styles.flagWhite}></div>
    <div className={styles.flagGreen}></div>
  </div>
)

const UKFlag = () => (
  <div className={styles.ukflag}>
    <div className={styles.ukCross1}></div>
    <div className={styles.ukCross2}></div>
  </div>
)

const RussianFlag = () => (
  <div className={styles.russianflag}>
    <div className={styles.flagWhite}></div>
    <div className={styles.flagBlue}></div>
    <div className={styles.flagRed}></div>
  </div>
)

export const Settings = ({ open, onClose }: SettingsProps) => {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<Language>('en')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [unit, setUnit] = useState<Unit>('ft²')

  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')}>
      <ModalBody>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('settings.language')}</h3>
          <div className={styles.options}>
            <Button
              variant={language === 'ar' ? 'primary' : 'secondary'}
              size="sm"
              iconLeft={<UAEFlag />}
              selected={language === 'ar'}
              onClick={() => setLanguage('ar')}
            >
              {t('settings.languages.arabic')}
            </Button>
            <Button
              variant={language === 'en' ? 'primary' : 'secondary'}
              size="sm"
              iconLeft={<UKFlag />}
              selected={language === 'en'}
              onClick={() => setLanguage('en')}
            >
              {t('settings.languages.english')}
            </Button>
            <Button
              variant={language === 'ru' ? 'primary' : 'secondary'}
              size="sm"
              iconLeft={<RussianFlag />}
              selected={language === 'ru'}
              onClick={() => setLanguage('ru')}
            >
              {t('settings.languages.russian')}
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('settings.currency')}</h3>
          <div className={styles.options}>
            {(['AED', 'USD', 'EUR', 'RUB', 'CNY'] as Currency[]).map(curr => (
              <Button
                key={curr}
                variant={currency === curr ? 'primary' : 'secondary'}
                size="sm"
                selected={currency === curr}
                onClick={() => setCurrency(curr)}
              >
                {curr}
              </Button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('settings.units')}</h3>
          <div className={styles.options}>
            <Button
              variant={unit === 'm²' ? 'primary' : 'secondary'}
              size="sm"
              selected={unit === 'm²'}
              onClick={() => setUnit('m²')}
            >
              {t('settings.units.squareMeters')}
            </Button>
            <Button
              variant={unit === 'ft²' ? 'primary' : 'secondary'}
              size="sm"
              selected={unit === 'ft²'}
              onClick={() => setUnit('ft²')}
            >
              {t('settings.units.squareFeet')}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  )
}
