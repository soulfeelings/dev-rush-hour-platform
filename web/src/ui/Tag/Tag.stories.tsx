import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { Tag } from './Tag'

const meta: Meta<typeof Tag> = {
  title: 'UI/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tag>

export const Interactive: Story = {
  args: {
    children: 'Active Filter',
    onRemove: fn(),
  },
}
