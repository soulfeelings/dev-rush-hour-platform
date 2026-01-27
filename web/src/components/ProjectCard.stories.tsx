import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { Star, Flame, Clock } from 'lucide-react'
import { ProjectCard, type CardBadge } from './ProjectCard'
import type { Property } from '../types/property'

const mockProperty: Property = {
  id: '1',
  title: 'Marina Residences',
  location: 'Dubai Marina',
  developer: 'Emaar Properties',
  priceFrom: 1500000,
  currency: 'AED',
  types: ['Apartment', 'Penthouse'],
  bedrooms: ['1', '2', '3'],
  completionDate: 'Q4 2025',
  area: 85,
  areaUnit: 'sqm',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  logoUrl: 'https://placehold.co/48x48/333/fff?text=E',
  coordinates: [25.0657, 55.1713],
  sale: 'sale',
  status: 'active',
  description: 'Premium waterfront living with stunning marina views.',
}

const demoBadges: CardBadge[] = [
  { text: 'Recommended', backgroundColor: '#F5A623', icon: <Star size={16} /> },
  { text: 'Hot', backgroundColor: '#E53935', icon: <Flame size={16} /> },
  { text: 'Soon', backgroundColor: '#4A4A4A', icon: <Clock size={16} /> },
]

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
        <div style={{ width: 320 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProjectCard>

export const Default: Story = {
  args: {
    property: mockProperty,
    badges: demoBadges,
  },
}

export const WithoutBadges: Story = {
  args: {
    property: mockProperty,
  },
}

export const WithoutLogo: Story = {
  args: {
    property: {
      ...mockProperty,
      logoUrl: undefined,
    },
    badges: demoBadges,
  },
}
