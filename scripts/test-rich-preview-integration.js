// Test script for rich preview integration with blog APIs
// This simulates the full flow from URL detection to metadata extraction

// Mock the required modules since we can't import them directly in Node.js
const testUrls = [
  'https://dev.to/bytesized/byte-sized-episode-2-the-creation-of-graph-theory-34g1',
  'https://habibblog.hashnode.dev/unleash-javascript-magic-with-these-epic-one-liners',
  'https://medium.com/@nataliedeweerd/how-to-use-the-dev-to-api-5gl3'
]

// Simulate the blog URL detection
function isBlogUrl(url) {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    if (hostname === 'medium.com' || hostname.endsWith('.medium.com')) {
      return { isBlog: true, platform: 'medium' }
    }
    
    if (hostname === 'hashnode.dev' || hostname.endsWith('.hashnode.dev') || 
        hostname === 'hashnode.com' || hostname.endsWith('.hashnode.com')) {
      return { isBlog: true, platform: 'hashnode' }
    }
    
    if (hostname === 'dev.to') {
      return { isBlog: true, platform: 'dev.to' }
    }
    
    if (hostname.endsWith('.substack.com')) {
      return { isBlog: true, platform: 'substack' }
    }

    return { isBlog: false }
  } catch {
    return { isBlog: false }
  }
}

// Simulate the Dev.to API service
async function fetchDevToMetadata(url) {
  const urlMatch = url.match(/dev\.to\/([^\/]+)\/([^\/\?]+)/)
  if (!urlMatch) {
    throw new Error('Invalid Dev.to URL format')
  }

  const [, username, slug] = urlMatch
  
  try {
    const pathResponse = await fetch(`https://dev.to/api/articles/${username}/${slug}`, {
      headers: {
        'Accept': 'application/vnd.forem.api-v1+json',
        'User-Agent': 'Link4Coders/1.0'
      }
    })

    if (pathResponse.ok) {
      const article = await pathResponse.json()
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
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
    } else {
      throw new Error(`Dev.to API request failed: ${pathResponse.status}`)
    }
  } catch (error) {
    throw new Error(`Failed to fetch Dev.to article: ${error.message}`)
  }
}

// Simulate the Medium scraping service
async function fetchMediumMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Medium article: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract metadata
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) ||
                      html.match(/<meta name="twitter:title" content="([^"]*)"/) ||
                      html.match(/<title[^>]*>([^<]*)<\/title>/)
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/) ||
                            html.match(/<meta name="twitter:description" content="([^"]*)"/) ||
                            html.match(/<meta name="description" content="([^"]*)"/)
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/) ||
                      html.match(/<meta name="twitter:image" content="([^"]*)"/)
    const authorMatch = html.match(/by\s+([^|]+)\s+\|/) ||
                       html.match(/<meta name="author" content="([^"]*)"/)

    // Clean up title
    let title = titleMatch ? titleMatch[1] : 'Untitled'
    title = title.replace(/\s*\|\s*Medium\s*$/, '').replace(/\s*\|\s*by\s+[^|]*\s*\|\s*Medium\s*$/, '')
    
    const description = descriptionMatch ? descriptionMatch[1] : null
    const featuredImage = imageMatch ? imageMatch[1] : null
    const authorName = authorMatch ? authorMatch[1].trim() : 'Unknown Author'

    return {
      type: 'blog_post',
      title: title.trim(),
      description: description,
      excerpt: description,
      featured_image: featuredImage,
      author: {
        name: authorName,
        profile_url: url.split('/').slice(0, 4).join('/') // Medium author profile URL
      },
      published_at: new Date().toISOString(), // Medium doesn't easily expose publish date
      tags: [],
      platform: 'medium',
      platform_logo: 'https://medium.com/favicon.ico',
      canonical_url: url,
      url: url,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    throw new Error(`Failed to parse Medium article: ${error.message}`)
  }
}

// Simulate the Hashnode scraping service
async function fetchHashnodeMetadata(url) {
  try {
    console.log('🔍 Fetching Hashnode post via web scraping')

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Hashnode rate limit exceeded, please try again later')
      }
      throw new Error(`Failed to fetch Hashnode post: ${response.status}`)
    }

    const html = await response.text()

    // Try to extract from Hashnode's Next.js data first
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
            tags: post.tags?.map(tag => tag.name) || [],
            platform: 'hashnode',
            platform_logo: 'https://hashnode.com/favicon.ico',
            reactions_count: post.reactionCount,
            comments_count: post.responseCount,
            canonical_url: post.canonicalUrl || url,
            url: url,
            fetched_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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

    const title = titleMatch ? titleMatch[1] : 'Untitled'
    const description = descriptionMatch ? descriptionMatch[1] : null
    const featuredImage = imageMatch ? imageMatch[1] : null

    return {
      type: 'blog_post',
      title: title,
      description: description,
      excerpt: description,
      featured_image: featuredImage,
      author: {
        name: 'Unknown Author'
      },
      published_at: new Date().toISOString(),
      tags: [],
      platform: 'hashnode',
      platform_logo: 'https://hashnode.com/favicon.ico',
      canonical_url: url,
      url: url,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    throw new Error(`Failed to parse Hashnode article: ${error.message}`)
  }
}

// Simulate the main rich preview service flow
async function fetchBlogMetadata(url, platform) {
  console.log(`🔍 Fetching metadata for ${platform} URL: ${url}`)

  switch (platform) {
    case 'dev.to':
      return await fetchDevToMetadata(url)
    case 'hashnode':
      return await fetchHashnodeMetadata(url)
    case 'medium':
      return await fetchMediumMetadata(url)
    default:
      throw new Error(`Unsupported blog platform: ${platform}`)
  }
}

// Main test function
async function testRichPreviewIntegration() {
  console.log('🚀 Testing Rich Preview Integration with Blog APIs...\n')
  
  for (const url of testUrls) {
    console.log(`\n📋 Testing URL: ${url}`)
    
    try {
      // Step 1: Detect if it's a blog URL
      const blogCheck = isBlogUrl(url)
      console.log(`🏷️  Platform detected: ${blogCheck.platform || 'unknown'}`)
      
      if (!blogCheck.isBlog || !blogCheck.platform) {
        console.log('❌ Not a supported blog platform')
        continue
      }
      
      // Step 2: Fetch blog metadata
      const metadata = await fetchBlogMetadata(url, blogCheck.platform)
      
      // Step 3: Display the extracted metadata
      console.log('✅ Successfully extracted blog metadata:')
      console.log(`   📝 Title: ${metadata.title}`)
      console.log(`   👤 Author: ${metadata.author.name}`)
      console.log(`   📅 Published: ${metadata.published_at}`)
      console.log(`   ⏱️  Reading time: ${metadata.reading_time_minutes || 'N/A'} min`)
      console.log(`   ❤️  Reactions: ${metadata.reactions_count || 'N/A'}`)
      console.log(`   💬 Comments: ${metadata.comments_count || 'N/A'}`)
      console.log(`   🖼️  Featured image: ${metadata.featured_image ? 'Yes' : 'No'}`)
      console.log(`   🏷️  Tags: ${metadata.tags?.length || 0} tags`)
      console.log(`   🌐 Platform: ${metadata.platform}`)
      
      // Step 4: Simulate what would be stored in the database
      console.log('\n💾 Database metadata structure:')
      console.log(JSON.stringify(metadata, null, 2))
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
    
    console.log('\n' + '='.repeat(80))
  }
  
  console.log('\n✅ Rich Preview Integration tests completed!')
}

// Run the tests
testRichPreviewIntegration().catch(console.error)
