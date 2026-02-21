import type { Lot } from '../../api'

export const mockProject = {
  id: 'mock-project-1',
  slug: 'the-oasis-tower',
  name: 'The Oasis Tower',
  status: 'active' as const,
  lat: 25.2048,
  lng: 55.2708,
  sale: 'sale' as const,
  developer: {
    id: 'dev-1',
    slug: 'emaar',
    name: 'Emaar Properties',
    data: {
      logoUrl: 'https://cdn.brandfetch.io/emaar.com/w/400/h/400/logo',
    },
  },
  area: {
    id: 'area-1',
    slug: 'downtown-dubai',
    name: 'Downtown Dubai',
  },
  badges: [
    {
      id: 'badge-1',
      slug: 'best-deal',
      name: 'Best Deal',
      backgroundColor: '#E8F5E9',
      textColor: '#2E7D32',
    },
  ],
  infrastructures: [
    { id: 'inf-1', name: 'Swimming Pool', icon: 'waves' },
    { id: 'inf-2', name: 'Gym', icon: 'dumbbell' },
    { id: 'inf-3', name: 'Kids Play Area', icon: 'baby' },
    { id: 'inf-4', name: 'BBQ Area', icon: 'flame' },
    { id: 'inf-5', name: 'Sauna', icon: 'thermometer' },
    { id: 'inf-6', name: 'Concierge', icon: 'bell-concierge' },
    { id: 'inf-7', name: 'Parking', icon: 'car' },
    { id: 'inf-8', name: 'Security 24/7', icon: 'shield-check' },
  ],
  data: {
    description:
      'The Oasis Tower is a prestigious residential development located in the heart of Downtown Dubai, offering breathtaking views of the Burj Khalifa and the Dubai Fountain. This luxury high-rise features world-class amenities, spacious apartments, and unmatched connectivity. Designed for those who desire a sophisticated urban lifestyle, each unit has been meticulously planned with premium finishes, floor-to-ceiling windows, and smart home technology. Residents will enjoy access to a rooftop infinity pool, state-of-the-art fitness center, private cinema, and lush landscaped gardens.',
    priceFromUs: 1_850_000,
    priceFromDeveloper: 2_200_000,
    roi: 8.5,
    paymentPlan: '60/40',
    completionDate: 'Q4 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timeline: {
      projectAnnouncement: '2024-03-15',
      bookingStarted: '2024-06-01',
      constructionStarted: '2024-09-20',
      constructionProgress: 'In progress',
      constructionProgressPercent: 35,
      expectedCompletion: '2026-12-01',
    },
    media: {
      logo: {
        url: 'https://placehold.co/200x200/1a1a2e/e0e0e0?text=Oasis',
      },
      cover: {
        url: 'https://placehold.co/1200x600/1a1a2e/e0e0e0?text=Cover+Image',
      },
      gallery: [
        { url: 'https://placehold.co/1200x600/2d2d44/e0e0e0?text=Gallery+1' },
        { url: 'https://placehold.co/1200x600/3d3d5c/e0e0e0?text=Gallery+2' },
        { url: 'https://placehold.co/1200x600/4d4d74/e0e0e0?text=Gallery+3' },
        { url: 'https://placehold.co/1200x600/5d5d8c/e0e0e0?text=Gallery+4' },
      ],
    },
  },
}

export const mockLots: Lot[] = [
  // Studio apartments
  {
    id: 'lot-1',
    status: 'active',
    type: 'apartment',
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 42,
    floor: 5,
    priceFromUs: 850_000,
    badges: [
      { name: 'Special Price', backgroundColor: '#ff6b9d', textColor: '#ffffff' },
      { name: 'New', backgroundColor: '#2dd4bf', textColor: '#1A1A1A' },
    ],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/2a4a6a/e0e0e0?text=Studio+A' },
        floorPlanImages: [{ url: 'https://placehold.co/600x400/3a5a7a/e0e0e0?text=Floor+Plan' }],
      },
    },
  },
  {
    id: 'lot-2',
    status: 'active',
    type: 'apartment',
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 48,
    floor: 12,
    priceFromUs: 920_000,
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/2a4a6a/e0e0e0?text=Studio+B' },
      },
    },
  },
  // 1BR apartments
  {
    id: 'lot-3',
    status: 'active',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 65,
    floor: 8,
    priceFromUs: 1_350_000,
    badges: [{ name: 'Best Layout', backgroundColor: '#E8F5E9', textColor: '#2E7D32' }],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/4a6a2a/e0e0e0?text=1BR+A' },
        floorPlanImages: [{ url: 'https://placehold.co/600x400/5a7a3a/e0e0e0?text=Floor+Plan' }],
      },
    },
  },
  {
    id: 'lot-4',
    status: 'active',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 72,
    floor: 15,
    priceFromUs: 1_500_000,
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/4a6a2a/e0e0e0?text=1BR+B' },
      },
    },
  },
  {
    id: 'lot-5',
    status: 'active',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 2,
    areaSqm: 78,
    floor: 22,
    priceFromUs: 1_650_000,
    badges: [{ name: 'Sea View', backgroundColor: '#E3F2FD', textColor: '#1565C0' }],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/4a6a2a/e0e0e0?text=1BR+C' },
      },
    },
  },
  // 2BR apartments
  {
    id: 'lot-6',
    status: 'active',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 110,
    floor: 10,
    priceFromUs: 2_100_000,
    badges: [{ name: 'Special Price', backgroundColor: '#ff6b9d', textColor: '#ffffff' }],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/6a2a4a/e0e0e0?text=2BR+A' },
        floorPlanImages: [{ url: 'https://placehold.co/600x400/7a3a5a/e0e0e0?text=Floor+Plan' }],
      },
    },
  },
  {
    id: 'lot-7',
    status: 'active',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 125,
    floor: 18,
    priceFromUs: 2_450_000,
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/6a2a4a/e0e0e0?text=2BR+B' },
      },
    },
  },
  {
    id: 'lot-8',
    status: 'active',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 3,
    areaSqm: 140,
    floor: 25,
    priceFromUs: 2_800_000,
    badges: [
      { name: 'Burj Khalifa View', backgroundColor: '#FFF3E0', textColor: '#E65100' },
      { name: 'New', backgroundColor: '#2dd4bf', textColor: '#1A1A1A' },
    ],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/6a2a4a/e0e0e0?text=2BR+C' },
      },
    },
  },
  // 3BR apartments
  {
    id: 'lot-9',
    status: 'active',
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 180,
    floor: 30,
    priceFromUs: 3_900_000,
    badges: [{ name: 'Premium', backgroundColor: '#F3E5F5', textColor: '#7B1FA2' }],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/2a2a6a/e0e0e0?text=3BR+A' },
        floorPlanImages: [{ url: 'https://placehold.co/600x400/3a3a7a/e0e0e0?text=Floor+Plan' }],
      },
    },
  },
  {
    id: 'lot-10',
    status: 'active',
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 4,
    areaSqm: 210,
    floor: 35,
    priceFromUs: 4_500_000,
    badges: [{ name: 'Penthouse Level', backgroundColor: '#FFF8E1', textColor: '#F57F17' }],
    data: {
      media: {
        cover: { url: 'https://placehold.co/600x400/2a2a6a/e0e0e0?text=3BR+B' },
      },
    },
  },
]
