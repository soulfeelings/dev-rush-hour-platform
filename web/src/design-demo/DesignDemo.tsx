import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DesignDemo.module.scss'
import { Button, Input, Select, Checkbox, SkeletonCard, Tooltip } from '../ui'

export default function DesignDemo() {
  const { t } = useTranslation()
  // Showcase form state
  const [showcaseSelect, setShowcaseSelect] = useState('opt1')

  return (
    <div className={styles.demo}>
      {/* UI Components Showcase */}
      <section className={styles.showcase}>
        <div className={styles.showcaseInner}>
          <div
            className={styles.sectionHeader}
            style={{ justifyContent: 'center', textAlign: 'center' }}
          >
            <div>
              <h2 className={styles.sectionTitle}>{t('designDemo.title')}</h2>
              <p className={styles.sectionSubtitle}>{t('designDemo.subtitle')}</p>
            </div>
          </div>

          {/* Colors */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>{t('designDemo.colors.title')}</h3>
            <p className={styles.showcaseSubtitle}>{t('designDemo.colors.subtitle')}</p>

            {/* Primary Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '16px',
              }}
            >
              {t('designDemo.colors.primary')}
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E5A732' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.primary')}
                  <br />
                  #E5A732
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#D19526' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.hover')}
                  <br />
                  #D19526
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#BD8620' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.active')}
                  <br />
                  #BD8620
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#FDF4E3' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.light')}
                  <br />
                  #FDF4E3
                </div>
              </div>
            </div>

            {/* Secondary Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              {t('designDemo.colors.secondary')}
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#2D8A7B' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.secondary')}
                  <br />
                  #2D8A7B
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#247568' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.hover')}
                  <br />
                  #247568
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E8F5F3' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.light')}
                  <br />
                  #E8F5F3
                </div>
              </div>
            </div>

            {/* Backgrounds */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              {t('designDemo.colors.backgrounds')}
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#FDFBF7' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.pageBg')}
                  <br />
                  #FDFBF7
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#FFFFFF' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.cardBg')}
                  <br />
                  #FFFFFF
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: 'rgba(0,0,0,0.5)' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.overlay')}
                  <br />
                  {t('designDemo.colors.swatches.overlayValue')}
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              {t('designDemo.colors.text')}
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#1A1A1A' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.primary')}
                  <br />
                  #1A1A1A
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#5A5A5A' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.secondary')}
                  <br />
                  #5A5A5A
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#8A8A8A' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.muted')}
                  <br />
                  #8A8A8A
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div
                  className={styles.swatchColor}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E0D8' }}
                />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.inverse')}
                  <br />
                  #FFFFFF
                </div>
              </div>
            </div>

            {/* Borders */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              {t('designDemo.colors.borders')}
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E5E0D8' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.border')}
                  <br />
                  #E5E0D8
                </div>
              </div>
            </div>

            {/* Status Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              {t('designDemo.colors.status')}
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#3D9970' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.success')}
                  <br />
                  #3D9970
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#D35649' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.error')}
                  <br />
                  #D35649
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E5A732' }} />
                <div className={styles.swatchLabel}>
                  {t('designDemo.colors.swatches.warning')}
                  <br />
                  #E5A732
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>{t('designDemo.typography.title')}</h3>
            <p className={styles.showcaseSubtitle}>{t('designDemo.typography.subtitle')}</p>
            <div className={styles.typographyDemo}>
              <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>
                {t('designDemo.typography.heading1')}
              </h1>
              <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>
                {t('designDemo.typography.heading2')}
              </h2>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {t('designDemo.typography.heading3')}
              </h3>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                {t('designDemo.typography.heading4')}
              </h4>
              <p style={{ fontSize: '1rem' }}>{t('designDemo.typography.body')}</p>
              <p style={{ fontSize: '0.875rem', color: '#5A5A5A' }}>
                {t('designDemo.typography.small')}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#8A8A8A' }}>
                {t('designDemo.typography.caption')}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>{t('designDemo.buttons.title')}</h3>
            <p className={styles.showcaseSubtitle}>{t('designDemo.buttons.subtitle')}</p>
            <div className={styles.showcaseRow}>
              <Button variant="primary">{t('designDemo.buttons.primary')}</Button>
              <Button variant="secondary">{t('designDemo.buttons.secondary')}</Button>
              <Button variant="ghost">{t('designDemo.buttons.ghost')}</Button>
              <Button variant="primary" disabled>
                {t('designDemo.buttons.disabled')}
              </Button>
            </div>
            <div className={styles.showcaseRow} style={{ marginTop: '16px' }}>
              <Button size="sm">{t('designDemo.buttons.small')}</Button>
              <Button size="md">{t('designDemo.buttons.default')}</Button>
              <Button size="lg">{t('designDemo.buttons.large')}</Button>
            </div>
          </div>

          {/* Form Elements */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>{t('designDemo.forms.title')}</h3>
            <p className={styles.showcaseSubtitle}>{t('designDemo.forms.subtitle')}</p>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <Input
                label={t('designDemo.forms.defaultInput')}
                placeholder={t('designDemo.forms.defaultPlaceholder')}
              />
              <Input
                label={t('designDemo.forms.errorInput')}
                value="invalid@"
                error={t('designDemo.forms.errorMessage')}
              />
              <Input
                label={t('designDemo.forms.successInput')}
                value="valid@email.com"
                state="success"
              />
              <Select
                label={t('designDemo.forms.selectLabel')}
                options={[
                  { value: 'opt1', label: t('designDemo.forms.option1') },
                  { value: 'opt2', label: t('designDemo.forms.option2') },
                  { value: 'opt3', label: t('designDemo.forms.option3') },
                ]}
                value={showcaseSelect}
                onChange={setShowcaseSelect}
              />
              <Checkbox label={t('designDemo.forms.checkboxLabel')} defaultChecked />
            </div>
          </div>

          {/* Loading Skeleton */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>{t('designDemo.loading.title')}</h3>
            <p className={styles.showcaseSubtitle}>{t('designDemo.loading.subtitle')}</p>
            <div style={{ maxWidth: '300px' }}>
              <SkeletonCard />
            </div>
          </div>

          {/* Tooltip Demo */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>{t('designDemo.tooltips.title')}</h3>
            <p className={styles.showcaseSubtitle}>{t('designDemo.tooltips.subtitle')}</p>
            <div className={styles.showcaseRow}>
              <Tooltip text={t('designDemo.tooltips.text')}>
                <Button variant="secondary" size="sm">
                  {t('designDemo.tooltips.hoverMe')}
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
