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
  priceFromUs: 20000000,
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

const sizes = [
  { width: 460, label: '460px' },
  { width: 380, label: '380px' },
  { width: 320, label: '320px', compact: true },
  { width: 260, label: '260px', compact: true },
]

export const Default: Story = {
  decorators: [
    () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {sizes.map(({ width, label, compact }) => (
          <div key={label}>
            <p style={{ marginBottom: 8, color: '#888', fontSize: 13 }}>
              {label}
              {compact ? ' (compact)' : ''}
            </p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ width }}>
                <p style={{ textAlign: 'center', marginBottom: 8, color: '#888', fontSize: 11 }}>
                  Default
                </p>
                <ProjectCard property={mockProperty} compact={compact} />
              </div>
              <div style={{ width }}>
                <p style={{ textAlign: 'center', marginBottom: 8, color: '#888', fontSize: 11 }}>
                  Hovered
                </p>
                <ProjectCard property={mockProperty} forceHovered compact={compact} />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  ],
  args: {
    property: mockProperty,
  },
}

export const WithoutBadges: Story = {
  decorators: [
    Story => (
      <div style={{ width: 460 }}>
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
      <div style={{ width: 460 }}>
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
