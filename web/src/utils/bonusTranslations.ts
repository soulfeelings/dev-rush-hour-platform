// bonusTranslations.ts
export const bonusTranslations: Record<string, string> = {
    'free_parking': 'Free Parking',
    'furnished': 'Furnished',
    'sea_view': 'Sea View',
    'private_beach_access': 'Private Beach Access',
    'flexible_payment': 'Flexible Payment',
    'early_bird_discount': 'Early Bird Discount',
    'free_maintenance_1year': 'Free Maintenance (1 Year)',
    'yacht_membership': 'Yacht Club Membership',
    'free_renovation': 'Free Renovation',
    'beachfront': 'Beachfront',
    'infinity_pool_access': 'Infinity Pool Access',
    'concierge_service': 'Concierge Service',
    'private_pool': 'Private Pool',
    'burj_khalifa_view': 'Burj Khalifa View',
    'mall_access': 'Mall Access',
    'free_valet_parking': 'Free Valet Parking',
    'club_membership': 'Club Membership'
  };
  
  export const translateBonusKey = (key: string): string => {
    return bonusTranslations[key] || key;
  };
  
  export const translateBonusKeys = (keys: string[]): string[] => {
    return keys.map(translateBonusKey);
  };