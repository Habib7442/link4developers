import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichLinkPreview } from './rich-link-preview';
import { UserLinkWithPreview } from '@/lib/types/rich-preview';

// Mock next/image since it's not available in tests
jest.mock('next/image', () => {
  return ({ alt, ...props }: any) => <img alt={alt} {...props} />;
});

// Mock window.open
global.open = jest.fn();

describe('RichLinkPreview', () => {
  const mockLink: UserLinkWithPreview = {
    id: '1',
    user_id: 'user1',
    title: 'Test Link',
    url: 'https://example.com',
    category: 'personal',
    position: 1,
    is_active: true,
    click_count: 0,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    preview_status: 'success',
    metadata: {
      type: 'webpage',
      title: 'Example Domain',
      description: 'This domain is for use in illustrative examples in documents.',
      image: null,
      favicon: null,
      site_name: null,
      domain: 'example.com',
      url: 'https://example.com'
    }
  };

  it('renders a rich preview card when metadata is available', () => {
    render(<RichLinkPreview link={mockLink} />);
    
    // Should render the link title from metadata
    expect(screen.getByText('Example Domain')).toBeInTheDocument();
    
    // Should render the domain
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('renders a basic link card when no metadata is available', () => {
    const linkWithoutMetadata: UserLinkWithPreview = {
      ...mockLink,
      metadata: undefined,
      preview_status: 'pending'
    };
    
    render(<RichLinkPreview link={linkWithoutMetadata} isPreviewMode={true} />);
    
    // Should render the link title from the link object
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('renders a basic link card in preview mode when metadata is empty', () => {
    const linkWithEmptyMetadata: UserLinkWithPreview = {
      ...mockLink,
      metadata: {} as any,
      preview_status: 'pending'
    };
    
    render(<RichLinkPreview link={linkWithEmptyMetadata} isPreviewMode={true} />);
    
    // Should render the link title from the link object
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });
});