import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { useState } from 'react'
import { Modal, ModalBody, ModalFooter } from './Modal'
import { Button } from '../Button/Button'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['compact', 'large'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Modal>

const ModalWrapper = ({ children, ...args }: React.ComponentProps<typeof Modal>) => {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ position: 'relative', width: '600px', height: '600px' }}>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} onClose={() => setOpen(false)}>
        {children}
      </Modal>
    </div>
  )
}

export const Default: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <ModalBody>
        <div>Это содержимое модального окна по умолчанию.</div>
      </ModalBody>
    </ModalWrapper>
  ),
  args: {
    title: 'Заголовок модалки',
    showCloseButton: true,
    size: 'compact',
    onClose: fn(),
  },
}

export const WithHeaderAndFooter: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <ModalBody>
        <p>Основное содержимое модального окна с заголовком и футером.</p>
        <p>Здесь может быть любая информация или форма.</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => {}}>
          Отмена
        </Button>
        <Button variant="primary" onClick={() => {}}>
          Сохранить
        </Button>
      </ModalFooter>
    </ModalWrapper>
  ),
  args: {
    title: 'Модалка с футером',
    showCloseButton: true,
    size: 'compact',
    onClose: fn(),
  },
}

export const Large: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <ModalBody>
        <p>Большая модалка для отображения большего количества контента.</p>
        <div style={{ height: '400px', padding: '20px' }}>
          <p>Здесь может быть длинный контент, таблицы, формы и т.д.</p>
        </div>
      </ModalBody>
    </ModalWrapper>
  ),
  args: {
    title: 'Большая модалка',
    showCloseButton: true,
    size: 'large',
    onClose: fn(),
  },
}

export const Minimal: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <ModalBody>
        <p>Минималистичный вариант модалки без стандартного заголовка.</p>
      </ModalBody>
    </ModalWrapper>
  ),
  args: {
    title: 'Минимальная модалка',
    showCloseButton: true,
    size: 'compact',
    onClose: fn(),
  },
}

export const WithoutHeader: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <ModalBody>
        <p>Модалка без стандартного заголовка, только кнопка закрытия.</p>
      </ModalBody>
    </ModalWrapper>
  ),
  args: {
    showCloseButton: true,
    size: 'compact',
    onClose: fn(),
  },
}

export const WithoutCloseButton: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <ModalBody>
        <p>Модалка без кнопки закрытия. Закрывается только по клику на overlay или Escape.</p>
      </ModalBody>
    </ModalWrapper>
  ),
  args: {
    title: 'Без кнопки закрытия',
    showCloseButton: false,
    size: 'compact',
    onClose: fn(),
  },
}

export const CustomContent: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <div style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Кастомный контент</h2>
        <p style={{ marginBottom: '16px' }}>
          Можно использовать любую разметку без ModalBody/ModalFooter.
        </p>
        <Button variant="primary" onClick={() => {}}>
          Действие
        </Button>
      </div>
    </ModalWrapper>
  ),
  args: {
    showCloseButton: true,
    size: 'compact',
    onClose: fn(),
  },
}
