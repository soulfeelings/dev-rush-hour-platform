import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { ProjectCard } from './ProjectCard'
import type { Property, PropertyBadge } from '../types/property'

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
  logoUrl: 'https://placehold.co/48x48/2a5a4a/fff?text=V',
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

const meta: Meta<typeof ProjectCard> = {
  title: 'Components/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProjectCard>

export const Default: Story = {
  decorators: [
    Story => (
      <>
        <style>
          {`
            .force-hover [class*="additionalInfo"] {
              max-height: 500px !important;
              opacity: 1 !important;
              padding: 12px 16px !important;
            }
            .force-hover [class*="hoverImageContainer"] {
              opacity: 1 !important;
            }
          `}
        </style>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 320 }}>
            <p style={{ textAlign: 'center', marginBottom: 8, color: '#888', fontSize: 13 }}>
              Default
            </p>
            <Story />
          </div>
          <div style={{ width: 320 }} className="force-hover">
            <p style={{ textAlign: 'center', marginBottom: 8, color: '#888', fontSize: 13 }}>
              Hovered
            </p>
            <Story />
          </div>
        </div>
      </>
    ),
  ],
  args: {
    property: mockProperty,
  },
}

export const WithoutBadges: Story = {
  decorators: [
    Story => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    property: {
      ...mockProperty,
      badges: [],
    },
  },
}

export const WithoutLogo: Story = {
  decorators: [
    Story => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    property: {
      ...mockProperty,
      logoUrl: undefined,
    },
  },
}
