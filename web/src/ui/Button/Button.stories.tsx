import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { Search, ChevronDown, ChevronUp, Plane } from 'lucide-react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Interactive: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Search size={16} />
        Search
      </>
    ),
    variant: 'secondary',
    size: 'sm',
    onClick: fn(),
  },
}

export const WithIconLeft: Story = {
  args: {
    children: 'Dubai',
    variant: 'primary',
    iconLeft: <Plane />,
    size: 'sm',
    onClick: fn(),
  },
}

export const WithIconRight: Story = {
  args: {
    children: 'Object Type',
    variant: 'secondary',
    iconRight: <ChevronDown />,
    size: 'sm',
    onClick: fn(),
  },
}

export const WithBothIcons: Story = {
  args: {
    children: 'Filter',
    variant: 'secondary',
    iconLeft: <Search />,
    iconRight: <ChevronDown />,
    size: 'sm',
    onClick: fn(),
  },
}

export const FilterStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="secondary" size="sm">
        Object Type
      </Button>
      <Button variant="secondary" size="sm" iconRight={<ChevronDown />}>
        Object Type
      </Button>
      <Button variant="secondary" size="sm" iconRight={<ChevronUp />}>
        Object Type
      </Button>
      <Button variant="primary" size="sm" iconLeft={<Plane />}>
        Dubai
      </Button>
      <Button variant="secondary" size="sm" iconLeft={<Plane />}>
        Dubai
      </Button>
      <Button variant="secondary" size="sm" iconLeft={<Search />}>
        Search
      </Button>
    </div>
  ),
}
