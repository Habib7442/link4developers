import { render, screen, fireEvent } from '@testing-library/react'
import { TechStackSelector } from './tech-stack-selector'
import { TechStackDisplay } from './tech-stack-display'

// Mock next/image since it's not available in tests
jest.mock('next/image', () => {
  return ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} />
  )
})

describe('TechStack Components', () => {
  describe('TechStackSelector', () => {
    it('renders without crashing', () => {
      render(<TechStackSelector selectedTechStacks={[]} onChange={jest.fn()} />)
      expect(screen.getByText('Frontend')).toBeInTheDocument()
    })

    it('displays selected tech stacks', () => {
      render(
        <TechStackSelector 
          selectedTechStacks={['react', 'next']} 
          onChange={jest.fn()} 
        />
      )
      
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
    })

    it('calls onChange when a tech stack is selected', () => {
      const mockOnChange = jest.fn()
      render(
        <TechStackSelector 
          selectedTechStacks={[]} 
          onChange={mockOnChange} 
        />
      )
      
      const reactButton = screen.getByText('React')
      fireEvent.click(reactButton)
      
      expect(mockOnChange).toHaveBeenCalledWith(['react'])
    })
  })

  describe('TechStackDisplay', () => {
    it('renders without crashing', () => {
      render(<TechStackDisplay techStackIds={[]} />)
    })

    it('displays tech stacks when provided', () => {
      render(<TechStackDisplay techStackIds={['react', 'next']} />)
      
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
    })

    it('does not render when no tech stacks are provided', () => {
      const { container } = render(<TechStackDisplay techStackIds={[]} />)
      expect(container.firstChild).toBeNull()
    })
  })
})