// Bump this version when any admin form's data shape changes
// to invalidate stale localStorage drafts across all forms.
const FORM_DRAFT_VERSION = 'v2'

const FORM_DRAFT_PREFIX = 'admin_'
const FORM_DRAFT_SUFFIX = '_form_draft_'

export const STORAGE_KEYS = {
  PROJECT_FORM: `admin_project_form_draft_${FORM_DRAFT_VERSION}`,
  INFRASTRUCTURE_FORM: `admin_infrastructure_form_draft_${FORM_DRAFT_VERSION}`,
  BADGE_FORM: `admin_badge_form_draft_${FORM_DRAFT_VERSION}`,
  DEVELOPER_FORM: `admin_developer_form_draft_${FORM_DRAFT_VERSION}`,
  LOT_FORM: `admin_lot_form_draft_${FORM_DRAFT_VERSION}`,
  AREA_FORM: `admin_area_form_draft_${FORM_DRAFT_VERSION}`,
  CITY_FORM: `admin_city_form_draft_${FORM_DRAFT_VERSION}`,
} as const

/**
 * Remove old form draft keys from localStorage.
 * Scans for keys matching `admin_*_form_draft_*` pattern
 * and deletes any that don't belong to the current version.
 */
export const cleanupOldDrafts = () => {
  const currentKeys = new Set(Object.values(STORAGE_KEYS))

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (
      key &&
      key.startsWith(FORM_DRAFT_PREFIX) &&
      key.includes(FORM_DRAFT_SUFFIX) &&
      // @ts-expect-error - key is a string
      !currentKeys.has(key)
    ) {
      localStorage.removeItem(key)
    }
  }
}
