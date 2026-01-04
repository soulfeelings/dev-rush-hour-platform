import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { Search } from 'lucide-react'
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
