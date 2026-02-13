import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import './MarkerPopup.scss'
import { MarkerPopup } from './MarkerPopup'
import type { Project } from '../../../api/generated/schemas/project'
import type { Badge } from '../../../api/generated/schemas/badge'

const demoBadges: Badge[] = [
  {
    id: '1',
    slug: 'service-charge',
    name: '1 year service charge',
    backgroundColor: '#4CAF50',
    textColor: 'white',
    icon: 'gift',
  },
  {
    id: '2',
    slug: 'fully-furniture',
    name: 'Fully furniture',
    backgroundColor: '#2196F3',
    textColor: 'white',
    icon: 'sparkles',
  },
  {
    id: '3',
    slug: 'special-price',
    name: 'Special price',
    backgroundColor: '#E53935',
    textColor: 'white',
    icon: 'key',
  },
]

const mockProject: Project = {
  id: '1',
  slug: '1',
  name: 'Vitality Residence',
  area: { name: 'Jumeirah Village Circle (JVC)' },
  developer: { name: 'Segrex Development' },
  priceFromUs: 20000000,
  priceFromDeveloper: 26666667,
  currency: 'AED',
  propertyTypes: ['Apartment', 'Penthouse'],
  bedrooms: ['studio', '1', '2'],
  completionDate: 'Q1 2026',
  areaSize: 85,
  areaUnit: 'sqm',
  media: {
    cover: { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
    hover: { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
    logo: { url: 'https://placehold.co/70x70/2a5a4a/fff?text=V' },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
    ],
  },
  lat: 25.0657,
  lng: 55.1713,
  sale: 'sale',
  status: 'active',
  description: 'Premium living in the heart of JVC.',
  roi: 7,
  paymentPlan: '30/10/60',
  pricesByType: [
    { type: 'studio, 1-2 beds', price: 15000000 },
    { type: 'apartaments', price: 21000000 },
    { type: 'penthouse', price: 32000000 },
  ],
  badges: demoBadges,
}

const PopupWithArrow = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div
      style={{
        filter:
          'drop-shadow(0 10px 40px rgba(0, 0, 0, 0.15)) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.1))',
      }}
    >
      {children}
    </div>
  </div>
)

const meta: Meta<typeof MarkerPopup> = {
  title: 'Components/MarkerPopup',
  component: MarkerPopup,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#333333' },
        { name: 'light-gray', value: '#f0f0f0' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <PopupWithArrow>
        <Story />
      </PopupWithArrow>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MarkerPopup>

export const Default: Story = {
  args: {
    project: mockProject,
  },
}

export const WithoutDiscount: Story = {
  args: {
    project: {
      ...mockProject,
      priceFromDeveloper: undefined,
    },
  },
}

export const WithoutROI: Story = {
  args: {
    project: {
      ...mockProject,
      roi: undefined,
    },
  },
}

export const WithoutBadges: Story = {
  args: {
    project: {
      ...mockProject,
      badges: [],
    },
  },
}

export const WithoutLogo: Story = {
  args: {
    project: {
      ...mockProject,
      media: {
        ...mockProject.media,
        logo: undefined,
      },
    },
  },
}

export const WithoutPricesByType: Story = {
  args: {
    project: {
      ...mockProject,
      pricesByType: [],
    },
  },
}

export const WithoutPaymentPlan: Story = {
  args: {
    project: {
      ...mockProject,
      paymentPlan: undefined,
      completionDate: undefined,
    },
  },
}

export const Minimal: Story = {
  args: {
    project: {
      ...mockProject,
      badges: [],
      media: {
        ...mockProject.media,
        logo: undefined,
      },
      roi: undefined,
      priceFromDeveloper: undefined,
      paymentPlan: undefined,
      completionDate: undefined,
      pricesByType: [],
    },
  },
}
