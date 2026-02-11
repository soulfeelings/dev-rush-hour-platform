import { useSettings } from '../features/Settings/Settings'

export const useIsRTL = () => {
  const { language } = useSettings()
  return language === 'ar'
}
