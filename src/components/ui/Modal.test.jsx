import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        Content
      </Modal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('should render title and children when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="My Modal">
        <p>Hello modal</p>
      </Modal>
    )
    expect(screen.getByText('My Modal')).toBeInTheDocument()
    expect(screen.getByText('Hello modal')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Closeable">
        Content
      </Modal>
    )
    await userEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should render the overlay backdrop', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        Content
      </Modal>
    )
    const overlay = container.firstChild
    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('bg-black')
  })
})
