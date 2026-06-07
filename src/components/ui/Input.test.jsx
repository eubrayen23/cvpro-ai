import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input placeholder="Enter name" />)
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
  })

  it('should render the label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should not render a label when none provided', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('label')).toBeNull()
  })

  it('should display error message when error prop is set', () => {
    render(<Input error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('should apply error styling to input when error prop is set', () => {
    render(<Input error="Error" placeholder="test" />)
    const input = screen.getByPlaceholderText('test')
    expect(input.className).toContain('border-red-500')
  })

  it('should apply normal border when no error', () => {
    render(<Input placeholder="test" />)
    const input = screen.getByPlaceholderText('test')
    expect(input.className).toContain('border-gray-300')
    expect(input.className).not.toContain('border-red-500')
  })

  it('should call onChange when typing', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="type here" />)
    await userEvent.type(screen.getByPlaceholderText('type here'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('should set the input type', () => {
    render(<Input type="email" placeholder="email" />)
    expect(screen.getByPlaceholderText('email')).toHaveAttribute('type', 'email')
  })

  it('should default to text type', () => {
    render(<Input placeholder="default" />)
    expect(screen.getByPlaceholderText('default')).toHaveAttribute('type', 'text')
  })

  it('should pass through extra props', () => {
    render(<Input data-testid="custom-input" />)
    expect(screen.getByTestId('custom-input')).toBeInTheDocument()
  })
})
