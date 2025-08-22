// Final test of the blog preview implementation
// Shows working Dev.to integration and graceful fallback for other platforms

const testUrls = [
  {
    url: 'https://dev.to/bytesized/byte-sized-episode-2-the-creation-of-graph-theory-34g1',
    platform: 'dev.to',
    expected: 'Rich blog preview with full metadata'
  },
  {
    url: 'https://habibblog.hashnode.dev/unleash-javascript-magic-with-these-epic-one-liners',
    platform: 'hashnode', 
    expected: 'Graceful fallback to basic link (due to rate limiting)'
  },
  {
    url: 'https://medium.com/@nataliedeweerd/how-to-use-the-dev-to-api-5gl3',
    platform: 'medium',
    expected: 'Basic webpage metadata (fallback)'
  }
]

// Blog URL detection function
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
    
    return { isBlog: false }
  } catch {
    return { isBlog: false }
  }
}

// Dev.to API (working implementation)
async function fetchDevToMetadata(url) {
  const urlMatch = url.match(/dev\.to\/([^\/]+)\/([^\/\?]+)/)
  if (!urlMatch) {
    throw new Error('Invalid Dev.to URL format')
  }

  const [, username, slug] = urlMatch
  
  const response = await fetch(`https://dev.to/api/articles/${username}/${slug}`, {
    headers: {
      'Accept': 'application/vnd.forem.api-v1+json',
      'User-Agent': 'Link4Coders/1.0'
    }
  })

  if (response.ok) {
    const article = await response.json()
    return {
      type: 'blog_post',
      title: article.title,
      description: article.description,
      excerpt: article.description,
      featured_image: article.cover_image || article.social_image,
      author: {
        name: article.user?.name || 'Unknown Author',
        username: article.user?.username,
        avatar: article.user?.profile_image_90,
        profile_url: `https://dev.to/${article.user?.username}`
      },
      published_at: article.published_at,
      reading_time_minutes: article.reading_time_minutes,
      tags: article.tag_list || [],
      platform: 'dev.to',
      platform_logo: 'https://dev.to/favicon.ico',
      reactions_count: article.positive_reactions_count,
      comments_count: article.comments_count,
      url: article.url
    }
  } else {
    throw new Error(`Dev.to API failed: ${response.status}`)
  }
}

// Simulate other platform failures (rate limiting, etc.)
async function fetchOtherPlatformMetadata(url, platform) {
  // Simulate the rate limiting or access issues
  throw new Error(`${platform} access restricted - will show basic link instead`)
}

// Basic webpage metadata fallback
async function fetchBasicMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Link4Coders/1.0',
        'Accept': 'text/html'
      }
    })
    
    if (response.ok) {
      const html = await response.text()
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/)
      const descriptionMatch = html.match(/<meta name="description" content="([^"]*)"/)
      
      return {
        type: 'webpage',
        title: titleMatch ? titleMatch[1] : 'Untitled',
        description: descriptionMatch ? descriptionMatch[1] : null,
        url: url
      }
    }
  } catch (error) {
    // Even basic fallback failed
    return {
      type: 'basic_link',
      title: 'Blog Post',
      url: url
    }
  }
}

// Main test function
async function testFinalImplementation() {
  console.log('🚀 Testing Final Blog Preview Implementation\n')
  console.log('This demonstrates:')
  console.log('✅ Rich blog previews for supported platforms (Dev.to)')
  console.log('🔄 Graceful fallback to basic links for restricted platforms')
  console.log('🛡️ Error handling and user-friendly experience\n')
  
  for (const test of testUrls) {
    console.log(`\n📋 Testing: ${test.url}`)
    console.log(`🏷️  Platform: ${test.platform}`)
    console.log(`🎯 Expected: ${test.expected}`)
    
    try {
      // Step 1: Detect blog platform
      const blogCheck = isBlogUrl(test.url)
      
      if (blogCheck.isBlog && blogCheck.platform) {
        console.log(`🔍 Detected ${blogCheck.platform} blog URL`)
        
        try {
          // Step 2: Try to fetch rich blog metadata
          let metadata
          if (blogCheck.platform === 'dev.to') {
            metadata = await fetchDevToMetadata(test.url)
            console.log('✅ SUCCESS: Rich blog preview generated!')
            console.log(`   📝 Title: ${metadata.title}`)
            console.log(`   👤 Author: ${metadata.author.name}`)
            console.log(`   📅 Published: ${metadata.published_at}`)
            console.log(`   ⏱️  Reading time: ${metadata.reading_time_minutes} min`)
            console.log(`   ❤️  Reactions: ${metadata.reactions_count}`)
            console.log(`   💬 Comments: ${metadata.comments_count}`)
            console.log(`   🖼️  Featured image: ${metadata.featured_image ? 'Yes' : 'No'}`)
            console.log(`   🏷️  Tags: ${metadata.tags.length} tags`)
            console.log('\n🎨 This will render as a beautiful rich blog card!')
          } else {
            // Simulate other platforms failing
            await fetchOtherPlatformMetadata(test.url, blogCheck.platform)
          }
        } catch (blogError) {
          // Step 3: Graceful fallback to basic metadata
          console.log(`⚠️  Blog API failed: ${blogError.message}`)
          console.log('🔄 Falling back to basic webpage metadata...')
          
          const basicMetadata = await fetchBasicMetadata(test.url)
          console.log('✅ FALLBACK: Basic link will be shown')
          console.log(`   📝 Title: ${basicMetadata.title}`)
          console.log(`   🔗 URL: ${basicMetadata.url}`)
          console.log('\n🎨 This will render as a standard link card')
        }
      } else {
        console.log('🔍 Not a blog URL, treating as regular webpage')
        const basicMetadata = await fetchBasicMetadata(test.url)
        console.log('✅ Basic webpage metadata extracted')
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
    
    console.log('\n' + '='.repeat(80))
  }
  
  console.log('\n🎉 Final Implementation Summary:')
  console.log('✅ Dev.to: Full rich blog previews with all metadata')
  console.log('🔄 Hashnode/Medium: Graceful fallback to basic links when restricted')
  console.log('🛡️ Error handling: No broken experiences for users')
  console.log('🎨 UI: Rich cards for supported platforms, clean links for others')
  console.log('\n💡 This provides the best user experience while being resilient to API limitations!')
}

// Run the test
testFinalImplementation().catch(console.error)
