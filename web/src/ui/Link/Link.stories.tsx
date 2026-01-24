import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { Link } from './Link'

const meta: Meta<typeof Link> = {
  title: 'UI/Link',
  component: Link,
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
  argTypes: {
    to: {
      control: 'text',
    },
    newTab: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof Link>

export const Interactive: Story = {
  args: {
    to: '/',
    children: 'Link text',
  },
}
