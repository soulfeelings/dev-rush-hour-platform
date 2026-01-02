import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Select>

export const Interactive: Story = {
  args: {
    options: [
      { value: 'all', label: 'All Options' },
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    value: 'all',
    placeholder: 'Select option',
    onChange: fn(),
  },
}

