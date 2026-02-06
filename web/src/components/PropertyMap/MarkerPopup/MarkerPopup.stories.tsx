import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { MarkerPopup } from './MarkerPopup'
import type { Property, PropertyBadge } from '../../../types/property'

const demoBadges: PropertyBadge[] = [
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

const mockProperty: Property = {
  id: '1',
  title: 'Vitality Residence',
  location: 'Jumeirah Village Circle (JVC)',
  developer: 'Segrex Development',
  priceFrom: 20000000,
  currency: 'AED',
  types: ['Apartment', 'Penthouse'],
  bedrooms: ['studio', '1', '2'],
  completionDate: 'Q1 2026',
  area: 85,
  areaUnit: 'sqm',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  hoverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  logoUrl: 'https://placehold.co/70x70/2a5a4a/fff?text=V',
  coordinates: [25.0657, 55.1713],
  sale: 'sale',
  status: 'active',
  description: 'Premium living in the heart of JVC.',
  roi: 7,
  discount: 25,
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
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '14px solid #fdfdfd',
          margin: '0 auto',
        }}
      />
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
    property: mockProperty,
  },
}

export const WithoutDiscount: Story = {
  args: {
    property: {
      ...mockProperty,
      discount: undefined,
    },
  },
}

export const WithoutROI: Story = {
  args: {
    property: {
      ...mockProperty,
      roi: undefined,
    },
  },
}

export const WithoutBadges: Story = {
  args: {
    property: {
      ...mockProperty,
      badges: [],
    },
  },
}

export const WithoutLogo: Story = {
  args: {
    property: {
      ...mockProperty,
      logoUrl: undefined,
    },
  },
}

export const WithoutPricesByType: Story = {
  args: {
    property: {
      ...mockProperty,
      pricesByType: [],
    },
  },
}

export const WithoutPaymentPlan: Story = {
  args: {
    property: {
      ...mockProperty,
      paymentPlan: undefined,
      completionDate: undefined,
    },
  },
}

export const Minimal: Story = {
  args: {
    property: {
      ...mockProperty,
      badges: [],
      logoUrl: undefined,
      roi: undefined,
      discount: undefined,
      paymentPlan: undefined,
      completionDate: undefined,
      pricesByType: [],
    },
  },
}
