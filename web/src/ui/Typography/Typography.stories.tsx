import type { Meta, StoryObj } from '@storybook/react-vite'
import { Typography } from './Typography'

const meta: Meta<typeof Typography> = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'body'],
    },
    size: {
      control: 'select',
      options: ['large', 'regular', 'small'],
    },
    weight: {
      control: 'select',
      options: ['medium', 'regular'],
    },
    as: {
      control: 'select',
      options: ['span', 'h1', 'p', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Typography>

export const Interactive: Story = {
  args: {
    children: 'Typography text',
    variant: 'body',
    size: 'regular',
    weight: 'regular',
    as: 'span',
  },
  parameters: {
    layout: 'centered',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Typography variant="h1" as="h1">
          Heading 1
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Typography variant="body" size="large" weight="regular">
          Body large regular
        </Typography>
        <Typography variant="body" size="large" weight="medium">
          Body large medium
        </Typography>
        <Typography variant="body" size="regular" weight="regular">
          Body regular regular
        </Typography>
        <Typography variant="body" size="regular" weight="medium">
          Body regular medium
        </Typography>
        <Typography variant="body" size="small" weight="regular">
          Body small regular
        </Typography>
        <Typography variant="body" size="small" weight="medium">
          Body small medium
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Typography variant="body" size="regular" weight="regular" as="p">
          Rendered as paragraph tag
        </Typography>
        <Typography variant="body" size="large" weight="medium" as="h2">
          Rendered as h2 tag
        </Typography>
        <Typography variant="body" size="regular" weight="regular" as="span">
          Rendered as span tag (default)
        </Typography>
      </div>

      <div>
        <Typography variant="body" size="regular" weight="regular">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris.
        </Typography>
      </div>
    </div>
  ),
}
