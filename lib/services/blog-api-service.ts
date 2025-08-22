// Blog Platform API Service for fetching blog post metadata
// Supports Dev.to, Hashnode, Medium (via RSS), and other platforms

import { 
  BlogPostMetadata, 
  PreviewFetchError,
  PREVIEW_CACHE_CONFIG 
} from '@/lib/types/rich-preview'

// Dev.to API configuration
const DEV_TO_API_BASE = 'https://dev.to/api'

// Hashnode GraphQL API configuration
const HASHNODE_API_BASE = 'https://gql.hashnode.com'

// Medium RSS configuration
const MEDIUM_RSS_BASE = 'https://medium.com'

class BlogApiService {
  /**
   * Fetch blog post metadata from various platforms
   */
  static async fetchBlogMetadata(url: string, platform: string): Promise<BlogPostMetadata> {
    try {
      console.log(`🔍 Blog API: Fetching metadata for ${platform} URL:`, url)

      switch (platform) {
        case 'dev.to':
          return await this.fetchDevToMetadata(url)
        case 'hashnode':
          return await this.fetchHashnodeMetadata(url)
        case 'medium':
          return await this.fetchMediumMetadata(url)
        case 'substack':
          return await this.fetchSubstackMetadata(url)
        default:
          throw new PreviewFetchError(`Unsupported blog platform: ${platform}`, 'UNSUPPORTED_PLATFORM', false)
      }
    } catch (error) {
      console.error('Blog API error:', error)
      
      if (error instanceof PreviewFetchError) {
        throw error
      }

      throw new PreviewFetchError('Failed to fetch blog post data', 'NETWORK_ERROR', true)
    }
  }

  /**
   * Fetch Dev.to article metadata
   */
  private static async fetchDevToMetadata(url: string): Promise<BlogPostMetadata> {
    // Extract article ID or slug from Dev.to URL
    const urlMatch = url.match(/dev\.to\/([^\/]+)\/([^\/\?]+)/)
    if (!urlMatch) {
      throw new PreviewFetchError('Invalid Dev.to URL format', 'INVALID_URL', false)
    }

    const [, username, slug] = urlMatch
    
    try {
      // Try to get article by path first
      const pathResponse = await fetch(`${DEV_TO_API_BASE}/articles/${username}/${slug}`, {
        headers: {
          'Accept': 'application/vnd.forem.api-v1+json',
          'User-Agent': 'Link4Coders/1.0'
        },
        next: {
          revalidate: PREVIEW_CACHE_CONFIG.webpage.ttl / 1000,
          tags: [`devto-article-${username}-${slug}`, 'blog-api', 'rich-preview']
        }
      })

      if (pathResponse.ok) {
        const article = await pathResponse.json()
        return this.transformDevToArticle(article)
      }

      // Fallback: search for article by username
      const searchResponse = await fetch(`${DEV_TO_API_BASE}/articles?username=${username}`, {
        headers: {
          'Accept': 'application/vnd.forem.api-v1+json',
          'User-Agent': 'Link4Coders/1.0'
        },
        next: {
          revalidate: PREVIEW_CACHE_CONFIG.webpage.ttl / 1000,
          tags: [`devto-user-${username}`, 'blog-api', 'rich-preview']
        }
      })

      if (!searchResponse.ok) {
        throw new PreviewFetchError('Dev.to API request failed', 'API_ERROR', true)
      }

      const articles = await searchResponse.json()
      const article = articles.find((a: any) => a.slug === slug)
      
      if (!article) {
        throw new PreviewFetchError('Article not found on Dev.to', 'NOT_FOUND', false)
      }

      return this.transformDevToArticle(article)

    } catch (error) {
      if (error instanceof PreviewFetchError) {
        throw error
      }
      throw new PreviewFetchError('Failed to fetch Dev.to article', 'NETWORK_ERROR', true)
    }
  }

  /**
   * Transform Dev.to article data to our metadata format
   */
  private static transformDevToArticle(article: any): BlogPostMetadata {
    return {
      type: 'blog_post',
      title: article.title || '',
      description: article.description || null,
      excerpt: article.description || null,
      featured_image: article.cover_image || article.social_image || null,
      author: {
        name: article.user?.name || 'Unknown Author',
        username: article.user?.username,
        avatar: article.user?.profile_image_90 || article.user?.profile_image,
        profile_url: article.user?.username ? `https://dev.to/${article.user.username}` : undefined
      },
      published_at: article.published_at || article.created_at,
      reading_time_minutes: article.reading_time_minutes,
      tags: article.tag_list || article.tags || [],
      platform: 'dev.to',
      platform_logo: 'https://dev.to/favicon.ico',
      reactions_count: article.positive_reactions_count || article.public_reactions_count,
      comments_count: article.comments_count,
      canonical_url: article.canonical_url || article.url,
      url: article.url,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.webpage.ttl).toISOString()
    }
  }

  /**
   * Fetch Hashnode article metadata using web scraping (primary method)
   */
  private static async fetchHashnodeMetadata(url: string): Promise<BlogPostMetadata> {
    try {
      console.log('🔍 Blog API: Fetching Hashnode post via web scraping')

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        next: {
          revalidate: PREVIEW_CACHE_CONFIG.webpage.ttl / 1000,
          tags: [`hashnode-post-${url}`, 'blog-api', 'rich-preview']
        }
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new PreviewFetchError('Hashnode rate limit exceeded - will show basic link instead', 'RATE_LIMITED', false)
        }
        if (response.status === 403) {
          throw new PreviewFetchError('Hashnode access restricted - will show basic link instead', 'ACCESS_DENIED', false)
        }
        throw new PreviewFetchError(`Hashnode returned ${response.status} - will show basic link instead`, 'NETWORK_ERROR', false)
      }

      const html = await response.text()
      return this.parseHashnodeHtml(html, url)

    } catch (error) {
      if (error instanceof PreviewFetchError) {
        throw error
      }
      throw new PreviewFetchError('Failed to parse Hashnode post', 'PARSE_ERROR', true)
    }
  }

  /**
   * Parse Hashnode HTML to extract article metadata
   */
  private static parseHashnodeHtml(html: string, url: string): BlogPostMetadata {
    // First try to extract from Hashnode's Next.js data
    const hashnodeDataMatch = html.match(/window\.__NEXT_DATA__\s*=\s*({.*?});/s)

    if (hashnodeDataMatch) {
      try {
        const data = JSON.parse(hashnodeDataMatch[1])
        if (data.props?.pageProps?.post) {
          const post = data.props.pageProps.post
          return {
            type: 'blog_post',
            title: post.title || 'Untitled',
            description: post.brief || null,
            excerpt: post.brief || null,
            featured_image: post.coverImage?.url || null,
            author: {
              name: post.author?.name || 'Unknown Author',
              username: post.author?.username,
              avatar: post.author?.profilePicture,
              profile_url: post.author?.username ? `https://hashnode.com/@${post.author.username}` : undefined
            },
            published_at: post.publishedAt || new Date().toISOString(),
            reading_time_minutes: post.readTimeInMinutes,
            tags: post.tags?.map((tag: any) => tag.name) || [],
            platform: 'hashnode',
            platform_logo: 'https://hashnode.com/favicon.ico',
            reactions_count: post.reactionCount,
            comments_count: post.responseCount,
            canonical_url: post.canonicalUrl || url,
            url: url,
            fetched_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.webpage.ttl).toISOString()
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse Hashnode Next.js data, falling back to meta tags')
      }
    }

    // Fallback to Open Graph and meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) ||
                      html.match(/<meta name="twitter:title" content="([^"]*)"/) ||
                      html.match(/<title[^>]*>([^<]*)<\/title>/)
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/) ||
                            html.match(/<meta name="twitter:description" content="([^"]*)"/) ||
                            html.match(/<meta name="description" content="([^"]*)"/)
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/) ||
                      html.match(/<meta name="twitter:image" content="([^"]*)"/)
    const authorMatch = html.match(/<meta name="author" content="([^"]*)"/)

    const title = titleMatch ? this.cleanText(titleMatch[1]) : 'Untitled'
    const description = descriptionMatch ? this.cleanText(descriptionMatch[1]) : null
    const featuredImage = imageMatch ? imageMatch[1] : null
    const authorName = authorMatch ? this.cleanText(authorMatch[1]) : 'Unknown Author'

    return {
      type: 'blog_post',
      title: title,
      description: description,
      excerpt: description,
      featured_image: featuredImage,
      author: {
        name: authorName
      },
      published_at: new Date().toISOString(),
      tags: [],
      platform: 'hashnode',
      platform_logo: 'https://hashnode.com/favicon.ico',
      canonical_url: url,
      url: url,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.webpage.ttl).toISOString()
    }
  }



  /**
   * Fetch Medium article metadata via web scraping
   */
  private static async fetchMediumMetadata(url: string): Promise<BlogPostMetadata> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        next: {
          revalidate: PREVIEW_CACHE_CONFIG.webpage.ttl / 1000,
          tags: [`medium-post-${url}`, 'blog-api', 'rich-preview']
        }
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new PreviewFetchError('Medium rate limit exceeded - will show basic link instead', 'RATE_LIMITED', false)
        }
        if (response.status === 403) {
          throw new PreviewFetchError('Medium access restricted - will show basic link instead', 'ACCESS_DENIED', false)
        }
        throw new PreviewFetchError(`Medium returned ${response.status} - will show basic link instead`, 'NETWORK_ERROR', false)
      }

      const html = await response.text()
      return this.parseMediumHtml(html, url)

    } catch (error) {
      if (error instanceof PreviewFetchError) {
        throw error
      }
      throw new PreviewFetchError('Failed to parse Medium article', 'PARSE_ERROR', true)
    }
  }

  /**
   * Parse Medium HTML to extract article metadata
   */
  private static parseMediumHtml(html: string, url: string): BlogPostMetadata {
    // Extract JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)
    let structuredData: any = null

    if (jsonLdMatch) {
      try {
        structuredData = JSON.parse(jsonLdMatch[1])
      } catch {
        // Ignore JSON parsing errors
      }
    }

    // Extract Open Graph and meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) ||
                      html.match(/<meta name="twitter:title" content="([^"]*)"/) ||
                      html.match(/<title[^>]*>([^<]*)<\/title>/)
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/) ||
                            html.match(/<meta name="twitter:description" content="([^"]*)"/) ||
                            html.match(/<meta name="description" content="([^"]*)"/)
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/) ||
                      html.match(/<meta name="twitter:image" content="([^"]*)"/)
    const authorMatch = html.match(/<meta property="article:author" content="([^"]*)"/) ||
                       html.match(/<meta name="author" content="([^"]*)"/)
    const publishedMatch = html.match(/<meta property="article:published_time" content="([^"]*)"/)

    // Extract author info from Medium-specific patterns
    const authorNameMatch = html.match(/"name":"([^"]*)"[^}]*"username":"([^"]*)"/) ||
                           html.match(/by\s+([^|]+)\s+\|/) ||
                           html.match(/<span[^>]*data-testid="authorName"[^>]*>([^<]+)<\/span>/)
    const authorImageMatch = html.match(/"imageId":"([^"]*)"/)

    // Clean up title by removing " | Medium" suffix
    let title = titleMatch ? titleMatch[1] : 'Untitled'
    title = title.replace(/\s*\|\s*Medium\s*$/, '').replace(/\s*\|\s*by\s+[^|]*\s*\|\s*Medium\s*$/, '')

    const description = descriptionMatch ? descriptionMatch[1] : null
    const featuredImage = imageMatch ? imageMatch[1] : null
    const authorName = authorNameMatch ? (authorNameMatch[1] || authorNameMatch[2] || authorNameMatch[3]) : (authorMatch ? authorMatch[1] : 'Unknown Author')
    const authorUsername = authorNameMatch && authorNameMatch[2] ? authorNameMatch[2] : null
    const publishedAt = publishedMatch ? publishedMatch[1] : new Date().toISOString()

    // Extract reading time from Medium's specific pattern
    const readingTimeMatch = html.match(/(\d+)\s*min\s*read/i)
    const readingTime = readingTimeMatch ? parseInt(readingTimeMatch[1]) : undefined

    return {
      type: 'blog_post',
      title: this.cleanText(title),
      description: description ? this.cleanText(description) : null,
      excerpt: description ? this.cleanText(description) : null,
      featured_image: featuredImage,
      author: {
        name: this.cleanText(authorName),
        username: authorUsername,
        avatar: authorImageMatch ? `https://miro.medium.com/fit/c/96/96/${authorImageMatch[1]}` : undefined,
        profile_url: authorUsername ? `https://medium.com/@${authorUsername}` : undefined
      },
      published_at: publishedAt,
      reading_time_minutes: readingTime,
      tags: [], // Medium tags are harder to extract reliably
      platform: 'medium',
      platform_logo: 'https://medium.com/favicon.ico',
      canonical_url: url,
      url: url,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.webpage.ttl).toISOString()
    }
  }

  /**
   * Fetch Substack article metadata via web scraping
   */
  private static async fetchSubstackMetadata(url: string): Promise<BlogPostMetadata> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        next: {
          revalidate: PREVIEW_CACHE_CONFIG.webpage.ttl / 1000,
          tags: [`substack-post-${url}`, 'blog-api', 'rich-preview']
        }
      })

      if (!response.ok) {
        throw new PreviewFetchError('Failed to fetch Substack article', 'NETWORK_ERROR', true)
      }

      const html = await response.text()
      return this.parseSubstackHtml(html, url)

    } catch (error) {
      if (error instanceof PreviewFetchError) {
        throw error
      }
      throw new PreviewFetchError('Failed to parse Substack article', 'PARSE_ERROR', true)
    }
  }

  /**
   * Parse Substack HTML to extract article metadata
   */
  private static parseSubstackHtml(html: string, url: string): BlogPostMetadata {
    // Extract Open Graph and meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) ||
                      html.match(/<title[^>]*>([^<]*)<\/title>/)
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/) ||
                            html.match(/<meta name="description" content="([^"]*)"/)
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/)
    const authorMatch = html.match(/<meta name="author" content="([^"]*)"/)
    const publishedMatch = html.match(/<meta property="article:published_time" content="([^"]*)"/)

    // Extract Substack-specific data
    const substackDataMatch = html.match(/window\._preloads\s*=\s*({.*?});/s)
    let substackData: any = null

    if (substackDataMatch) {
      try {
        substackData = JSON.parse(substackDataMatch[1])
      } catch {
        // Ignore JSON parsing errors
      }
    }

    const title = titleMatch ? titleMatch[1] : 'Untitled'
    const description = descriptionMatch ? descriptionMatch[1] : null
    const featuredImage = imageMatch ? imageMatch[1] : null
    const authorName = authorMatch ? authorMatch[1] : 'Unknown Author'
    const publishedAt = publishedMatch ? publishedMatch[1] : new Date().toISOString()

    return {
      type: 'blog_post',
      title: this.cleanText(title),
      description: description ? this.cleanText(description) : null,
      excerpt: description ? this.cleanText(description) : null,
      featured_image: featuredImage,
      author: {
        name: this.cleanText(authorName),
        profile_url: url.split('/p/')[0] // Substack author profile URL
      },
      published_at: publishedAt,
      tags: [],
      platform: 'substack',
      platform_logo: 'https://substack.com/favicon.ico',
      canonical_url: url,
      url: url,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.webpage.ttl).toISOString()
    }
  }

  /**
   * Clean and decode HTML text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim()
  }
}

export { BlogApiService }
