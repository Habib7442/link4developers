// Test script for blog API functionality
// Run with: node scripts/test-blog-apis.js

const testUrls = [
  // Dev.to URLs (known working)
  'https://dev.to/bytesized/byte-sized-episode-2-the-creation-of-graph-theory-34g1',

  // Hashnode URLs (test with the provided URL)
  'https://habibblog.hashnode.dev/unleash-javascript-magic-with-these-epic-one-liners',

  // Medium URLs (test with different articles)
  'https://medium.com/@nataliedeweerd/how-to-use-the-dev-to-api-5gl3'
]

// Import the blog detection function
function isBlogUrl(url) {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Medium
    if (hostname === 'medium.com' || hostname.endsWith('.medium.com')) {
      return { isBlog: true, platform: 'medium' }
    }
    
    // Hashnode
    if (hostname === 'hashnode.dev' || hostname.endsWith('.hashnode.dev') || 
        hostname === 'hashnode.com' || hostname.endsWith('.hashnode.com')) {
      return { isBlog: true, platform: 'hashnode' }
    }
    
    // Dev.to
    if (hostname === 'dev.to') {
      return { isBlog: true, platform: 'dev.to' }
    }
    
    // Substack
    if (hostname.endsWith('.substack.com')) {
      return { isBlog: true, platform: 'substack' }
    }
    
    return { isBlog: false }
  } catch {
    return { isBlog: false }
  }
}

// Test Dev.to API
async function testDevToAPI(url) {
  console.log(`\n🔍 Testing Dev.to API with: ${url}`)
  
  const urlMatch = url.match(/dev\.to\/([^\/]+)\/([^\/\?]+)/)
  if (!urlMatch) {
    console.log('❌ Invalid Dev.to URL format')
    return
  }

  const [, username, slug] = urlMatch
  console.log(`📝 Extracted: username=${username}, slug=${slug}`)
  
  try {
    // Try to get article by path first
    const pathResponse = await fetch(`https://dev.to/api/articles/${username}/${slug}`, {
      headers: {
        'Accept': 'application/vnd.forem.api-v1+json',
        'User-Agent': 'Link4Coders/1.0'
      }
    })

    if (pathResponse.ok) {
      const article = await pathResponse.json()
      console.log('✅ Successfully fetched article:')
      console.log(`   Title: ${article.title}`)
      console.log(`   Author: ${article.user?.name}`)
      console.log(`   Published: ${article.published_at}`)
      console.log(`   Reading time: ${article.reading_time_minutes} min`)
      console.log(`   Reactions: ${article.positive_reactions_count}`)
      return article
    } else {
      console.log(`❌ Failed to fetch article: ${pathResponse.status} ${pathResponse.statusText}`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
}

// Test Hashnode GraphQL API
async function testHashnodeAPI(url) {
  console.log(`\n🔍 Testing Hashnode API with: ${url}`)
  
  const urlMatch = url.match(/https?:\/\/([^\/]+)\.hashnode\.dev\/([^\/\?]+)/) ||
                   url.match(/https?:\/\/hashnode\.com\/post\/([^\/\?]+)/)
  
  if (!urlMatch) {
    console.log('❌ Invalid Hashnode URL format')
    return
  }

  const slug = urlMatch[2] || urlMatch[1]
  console.log(`📝 Extracted slug: ${slug}`)
  
  const query = `
    query GetPost($slug: String!) {
      post(slug: $slug) {
        id
        title
        brief
        coverImage {
          url
        }
        author {
          name
          username
          profilePicture
        }
        publishedAt
        readTimeInMinutes
        tags {
          name
        }
        reactionCount
        responseCount
        url
      }
    }
  `

  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Link4Coders/1.0'
      },
      body: JSON.stringify({
        query,
        variables: { slug }
      })
    })

    if (response.ok) {
      const result = await response.json()
      
      if (result.errors || !result.data?.post) {
        console.log('❌ Post not found or GraphQL errors:', result.errors)
        return
      }

      const post = result.data.post
      console.log('✅ Successfully fetched post:')
      console.log(`   Title: ${post.title}`)
      console.log(`   Author: ${post.author?.name}`)
      console.log(`   Published: ${post.publishedAt}`)
      console.log(`   Reading time: ${post.readTimeInMinutes} min`)
      console.log(`   Reactions: ${post.reactionCount}`)
      return post
    } else {
      console.log(`❌ Failed to fetch post: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
}

// Test Medium web scraping
async function testMediumScraping(url) {
  console.log(`\n🔍 Testing Medium scraping with: ${url}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (response.ok) {
      const html = await response.text()
      
      // Extract basic metadata
      const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) ||
                        html.match(/<title[^>]*>([^<]*)<\/title>/)
      const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/)
      const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/)
      
      console.log('✅ Successfully scraped Medium article:')
      console.log(`   Title: ${titleMatch ? titleMatch[1] : 'Not found'}`)
      console.log(`   Description: ${descriptionMatch ? descriptionMatch[1].substring(0, 100) + '...' : 'Not found'}`)
      console.log(`   Image: ${imageMatch ? 'Found' : 'Not found'}`)
      
      return {
        title: titleMatch ? titleMatch[1] : null,
        description: descriptionMatch ? descriptionMatch[1] : null,
        image: imageMatch ? imageMatch[1] : null
      }
    } else {
      console.log(`❌ Failed to fetch article: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Blog API Tests...\n')
  
  for (const url of testUrls) {
    const blogCheck = isBlogUrl(url)
    console.log(`\n📋 Testing URL: ${url}`)
    console.log(`🏷️  Platform detected: ${blogCheck.platform || 'unknown'}`)
    
    if (blogCheck.platform === 'dev.to') {
      await testDevToAPI(url)
    } else if (blogCheck.platform === 'hashnode') {
      await testHashnodeAPI(url)
    } else if (blogCheck.platform === 'medium') {
      await testMediumScraping(url)
    }
    
    console.log('\n' + '='.repeat(80))
  }
  
  console.log('\n✅ Blog API tests completed!')
}

// Run the tests
runTests().catch(console.error)
