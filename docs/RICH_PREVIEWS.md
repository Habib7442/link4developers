# Rich Link Previews - Link4Coders

This document describes the rich link preview system that transforms basic links into engaging, informative cards with GitHub integration and Open Graph metadata.

## 🌟 Features

### GitHub Repository Integration
- **Automatic Detection**: Recognizes GitHub repository URLs
- **Rich Metadata**: Fetches repository name, description, language, topics, stars, forks
- **Real-time Stats**: Shows current star count, fork count, and last updated date
- **Owner Information**: Displays repository owner avatar and username
- **License Information**: Shows repository license when available

### Open Graph Previews
- **Website Metadata**: Extracts title, description, and featured images
- **Favicon Support**: Shows website favicons for brand recognition
- **Domain Information**: Displays clean domain names and site names
- **Social Media Optimization**: Leverages Open Graph meta tags

### Design & UX
- **Aceternity UI Inspired**: Modern glassmorphic design with smooth animations
- **Responsive Cards**: Adapts to different screen sizes and layouts
- **Hover Effects**: Subtle animations and state changes
- **Loading States**: Elegant loading indicators during data fetching
- **Error Handling**: Graceful fallbacks for failed previews

## 🏗️ Architecture

### Database Schema
```sql
-- Extended user_links table
ALTER TABLE user_links ADD COLUMN category TEXT;
ALTER TABLE user_links ADD COLUMN preview_fetched_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_links ADD COLUMN preview_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_links ADD COLUMN preview_status TEXT DEFAULT 'pending';

-- Metadata stored in existing metadata JSONB column
-- GitHub: { type: 'github_repo', repo_name, description, language, stars, forks, ... }
-- Webpage: { type: 'webpage', title, description, image, favicon, domain, ... }
```

### Service Layer
- **RichPreviewService**: Main orchestrator for preview operations
- **GitHubApiService**: GitHub API integration with rate limiting
- **MetaScraperService**: Open Graph and HTML metadata extraction
- **ApiLinkService**: Extended with preview management methods

### Component Structure
```
components/rich-preview/
├── rich-link-preview.tsx      # Main preview component
├── github-repo-card.tsx       # GitHub repository cards
├── webpage-preview-card.tsx   # Webpage preview cards
└── loading-states.tsx         # Loading and error states
```

## 🚀 Getting Started

### 1. Run Database Migration
```bash
# Apply the rich preview schema changes
npm run migrate:rich-previews
```

### 2. Environment Variables
```env
# Optional: GitHub token for higher rate limits
GITHUB_TOKEN=your_github_token_here
GITHUB_ACCESS_TOKEN=your_github_token_here
```

### 3. Update Components
The existing templates have been updated to use rich previews:
- `DeveloperDarkTemplate`
- `GitHubFocusTemplate`
- `MinimalistLightTemplate`

## 📖 Usage

### Basic Implementation
```tsx
import { RichLinkPreview } from '@/components/rich-preview/rich-link-preview'

function MyComponent({ link }) {
  const handleRefresh = async (linkId: string) => {
    await ApiLinkService.refreshLinkPreview(userId, linkId)
  }

  return (
    <RichLinkPreview
      link={link}
      onRefresh={handleRefresh}
      variant="default"
      showRefreshButton={true}
    />
  )
}
```

### API Operations
```tsx
// Refresh a single preview
await ApiLinkService.refreshLinkPreview(userId, linkId)

// Batch refresh multiple previews
await ApiLinkService.batchRefreshPreviews(userId, linkIds)

// Get preview statistics
const stats = await ApiLinkService.getPreviewStats(userId)

// Clear preview data
await ApiLinkService.clearLinkPreview(userId, linkId)
```

## 🔧 Configuration

### Cache Settings
```typescript
export const PREVIEW_CACHE_CONFIG = {
  github: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    staleWhileRevalidate: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  webpage: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    staleWhileRevalidate: 30 * 24 * 60 * 60 * 1000, // 30 days
  }
}
```

### Component Variants
- **default**: Full-featured cards with all metadata
- **compact**: Condensed view for lists and sidebars
- **detailed**: Extended view with additional information

## 🛡️ Security & Performance

### Rate Limiting
- GitHub API: Respects rate limits with automatic backoff
- Meta Scraping: Implements request timeouts and size limits
- Batch Operations: Processes links in controlled batches

### Data Validation
- URL validation prevents SSRF attacks
- Content-type checking for HTML pages
- Size limits for downloaded content
- Sanitization of extracted metadata

### Caching Strategy
- Database-level caching with expiration
- Stale-while-revalidate for better UX
- Background refresh for expired previews
- Failure cooldown to prevent spam

## 🔍 Monitoring & Analytics

### Preview Statistics
```typescript
interface PreviewStats {
  total: number
  success: number
  failed: number
  pending: number
  github: number
  webpage: number
  recentlyUpdated: number
  needsRefresh: number
}
```

### Error Handling
- Graceful degradation to basic links
- Retry mechanisms for transient failures
- Detailed error logging and reporting
- User-friendly error messages

## 🚀 Future Enhancements

### Planned Features
- [ ] Video preview support (YouTube, Vimeo)
- [ ] Social media post previews (Twitter, LinkedIn)
- [ ] PDF document previews
- [ ] Image gallery previews
- [ ] Custom preview templates
- [ ] Preview analytics dashboard

### Performance Optimizations
- [ ] CDN integration for images
- [ ] WebP image conversion
- [ ] Lazy loading for off-screen previews
- [ ] Service worker caching
- [ ] GraphQL API for GitHub data

## 🐛 Troubleshooting

### Common Issues

**GitHub API Rate Limits**
- Add `GITHUB_TOKEN` environment variable
- Implement exponential backoff
- Use GraphQL API for better efficiency

**Preview Not Loading**
- Check network connectivity
- Verify URL accessibility
- Review CORS policies for external sites

**Database Errors**
- Ensure migration has been applied
- Check RLS policies for user access
- Verify function permissions

### Debug Mode
```typescript
// Enable detailed logging
localStorage.setItem('debug-rich-previews', 'true')
```

## 📚 API Reference

### Endpoints
- `GET /api/links/preview?linkId=xxx` - Get preview for link
- `POST /api/links/preview` - Refresh preview
- `PUT /api/links/preview/batch` - Batch refresh
- `DELETE /api/links/preview?linkId=xxx` - Clear preview
- `GET /api/links/preview/stats` - Get statistics

### Database Functions
- `needs_preview_refresh(link_id)` - Check if refresh needed
- `update_link_preview(link_id, metadata, status)` - Update preview
- `mark_preview_failed(link_id, error)` - Mark as failed

---

For more information, see the [main documentation](../README.md) or [contact support](mailto:support@link4coders.in).
