import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('should render children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Click</Button>)
    await userEvent.click(screen.getByText('Click'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should apply disabled attribute', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('should apply primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByText('Primary')
    expect(btn.className).toContain('bg-blue-600')
  })

  it('should apply secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByText('Secondary')
    expect(btn.className).toContain('bg-gray-200')
  })

  it('should apply danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>)
    const btn = screen.getByText('Delete')
    expect(btn.className).toContain('bg-red-600')
  })

  it('should apply outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>)
    const btn = screen.getByText('Outline')
    expect(btn.className).toContain('border-blue-600')
  })

  it('should merge custom className', () => {
    render(<Button className="mt-4">Custom</Button>)
    expect(screen.getByText('Custom').className).toContain('mt-4')
  })

  it('should pass through extra props', () => {
    render(<Button data-testid="my-btn">Test</Button>)
    expect(screen.getByTestId('my-btn')).toBeInTheDocument()
  })
})
