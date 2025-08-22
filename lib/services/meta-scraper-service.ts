// Meta Scraper Service for fetching Open Graph and HTML metadata
// Extracts title, description, images, and other metadata from web pages

import { 
  WebpageMetadata, 
  WebpageData,
  OpenGraphData,
  HtmlMetaData,
  PreviewFetchError,
  PREVIEW_CACHE_CONFIG 
} from '@/lib/types/rich-preview'

class MetaScraperService {
  private static readonly USER_AGENT = 'Link4Coders-Bot/1.0 (+https://link4coders.in)'
  private static readonly TIMEOUT = 10000 // 10 seconds
  private static readonly MAX_CONTENT_LENGTH = 2 * 1024 * 1024 // 2MB

  /**
   * Fetch webpage metadata including Open Graph and HTML meta tags
   */
  static async fetchWebpageMetadata(url: string): Promise<WebpageMetadata> {
    try {
      // Validate and normalize URL
      const normalizedUrl = this.normalizeUrl(url)
      const domain = this.extractDomain(normalizedUrl)

      // Fetch webpage content
      const html = await this.fetchHtmlContent(normalizedUrl)
      
      // Parse metadata
      const webpageData = this.parseHtmlMetadata(html, normalizedUrl, domain)
      
      // Transform to our metadata format
      const metadata: WebpageMetadata = {
        type: 'webpage',
        title: webpageData.title || webpageData.og.title || webpageData.meta.title || null,
        description: webpageData.description || webpageData.og.description || webpageData.meta.description || null,
        image: webpageData.image || webpageData.og.image || null,
        favicon: webpageData.favicon || webpageData.meta.favicon || null,
        site_name: webpageData.site_name || webpageData.og.site_name || null,
        domain: webpageData.domain,
        url: normalizedUrl,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.webpage.ttl).toISOString()
      }

      return metadata

    } catch (error) {
      console.error('Meta scraper error:', error)
      
      if (error instanceof PreviewFetchError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          throw new PreviewFetchError('Page not found', 'NOT_FOUND', false)
        }
        if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
          throw new PreviewFetchError('Request timeout', 'NETWORK_ERROR', true)
        }
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new PreviewFetchError('Access forbidden', 'NETWORK_ERROR', false)
        }
      }

      throw new PreviewFetchError('Failed to fetch webpage metadata', 'NETWORK_ERROR', true)
    }
  }

  /**
   * Fetch HTML content from URL with proper headers and error handling
   */
  private static async fetchHtmlContent(url: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

    try {
      const domain = this.extractDomain(url)
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal,
        redirect: 'follow',
        next: {
          revalidate: PREVIEW_CACHE_CONFIG.webpage.ttl / 1000, // Cache for 7 days
          tags: [`webpage-${domain}`, 'webpage-metadata', 'rich-preview']
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check content type
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        throw new PreviewFetchError('URL does not point to an HTML page', 'INVALID_URL', false)
      }

      // Check content length
      const contentLength = response.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > this.MAX_CONTENT_LENGTH) {
        throw new PreviewFetchError('Content too large', 'INVALID_URL', false)
      }

      const html = await response.text()
      
      // Basic HTML validation
      if (!html.includes('<html') && !html.includes('<HTML')) {
        throw new PreviewFetchError('Invalid HTML content', 'PARSE_ERROR', false)
      }

      return html

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new PreviewFetchError('Request timeout', 'NETWORK_ERROR', true)
      }
      
      throw error
    }
  }

  /**
   * Parse HTML content to extract metadata
   */
  private static parseHtmlMetadata(html: string, url: string, domain: string): WebpageData {
    const data: WebpageData = {
      url,
      domain,
      og: {},
      meta: {}
    }

    try {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
      if (titleMatch) {
        data.title = this.cleanText(titleMatch[1])
        data.meta.title = data.title
      }

      // Extract meta tags
      const metaMatches = html.matchAll(/<meta[^>]+>/gi)
      for (const match of metaMatches) {
        const metaTag = match[0]
        this.parseMetaTag(metaTag, data)
      }

      // Extract favicon
      const faviconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]*>/i)
      if (faviconMatch) {
        const hrefMatch = faviconMatch[0].match(/href=["']([^"']+)["']/i)
        if (hrefMatch) {
          data.favicon = this.resolveUrl(hrefMatch[1], url)
          data.meta.favicon = data.favicon
        }
      }

      // Set fallback values
      data.title = data.title || data.og.title || data.meta.title
      data.description = data.description || data.og.description || data.meta.description
      data.image = data.image || data.og.image
      data.site_name = data.site_name || data.og.site_name

      // Generate favicon URL if not found
      if (!data.favicon) {
        data.favicon = `${new URL(url).origin}/favicon.ico`
      }

    } catch (error) {
      console.warn('Error parsing HTML metadata:', error)
      // Continue with partial data
    }

    return data
  }

  /**
   * Parse individual meta tag
   */
  private static parseMetaTag(metaTag: string, data: WebpageData): void {
    const propertyMatch = metaTag.match(/property=["']([^"']+)["']/i)
    const nameMatch = metaTag.match(/name=["']([^"']+)["']/i)
    const contentMatch = metaTag.match(/content=["']([^"']*)["']/i)

    if (!contentMatch) return

    const content = this.cleanText(contentMatch[1])
    if (!content) return

    // Open Graph tags
    if (propertyMatch) {
      const property = propertyMatch[1].toLowerCase()
      switch (property) {
        case 'og:title':
          data.og.title = content
          break
        case 'og:description':
          data.og.description = content
          break
        case 'og:image':
          data.og.image = this.resolveUrl(content, data.url)
          break
        case 'og:url':
          data.og.url = content
          break
        case 'og:site_name':
          data.og.site_name = content
          break
        case 'og:type':
          data.og.type = content
          break
      }
    }

    // Standard meta tags
    if (nameMatch) {
      const name = nameMatch[1].toLowerCase()
      switch (name) {
        case 'description':
          data.meta.description = content
          break
        case 'canonical':
          data.meta.canonical = content
          break
      }
    }
  }

  /**
   * Normalize URL
   */
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.toString()
    } catch {
      throw new PreviewFetchError('Invalid URL format', 'INVALID_URL', false)
    }
  }

  /**
   * Extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      throw new PreviewFetchError('Invalid URL format', 'INVALID_URL', false)
    }
  }

  /**
   * Resolve relative URL to absolute URL
   */
  private static resolveUrl(relativeUrl: string, baseUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).toString()
    } catch {
      return relativeUrl
    }
  }

  /**
   * Clean and normalize text content
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .trim()
  }
}

export { MetaScraperService }
