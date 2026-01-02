import type { Meta, StoryObj } from '@storybook/react-vite'
import ResizableSplitter from './ResizableSplitter'

const meta = {
  title: 'Components/ResizableSplitter',
  component: ResizableSplitter,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResizableSplitter>

export default meta
type Story = StoryObj<typeof meta>

// Имитация карты для демонстрации
const MapMock = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      borderRadius: '8px',
    }}
  >
    🗺️ Карта проектов
  </div>
)

// Каталог с карточками проектов
const CatalogMock = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          height: '400px',
          marginBottom: '20px',
        }}
      >
        Left panel content
      </div>
    </div>
  )
}

export const Interactive: Story = {
  args: {
    leftPanel: <MapMock />,
    rightPanel: <CatalogMock />,
    initialLeftWidth: 40,
    minLeftWidth: 30,
    minRightWidth: 20,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Интерактивный разделитель панелей с картой и каталогом проектов. Можно изменять ширину панелей перетаскиванием разделителя.',
      },
    },
  },
}
