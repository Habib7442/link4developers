// Simple Hashnode test
const testUrl = 'https://habibblog.hashnode.dev/unleash-javascript-magic-with-these-epic-one-liners'

console.log('🔍 Testing Hashnode web scraping...')

fetch(testUrl, {
  headers: {
    'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
})
.then(response => {
  console.log(`Status: ${response.status}`)
  if (response.ok) {
    return response.text()
  } else {
    throw new Error(`HTTP ${response.status}`)
  }
})
.then(html => {
  console.log('✅ Successfully fetched HTML')
  console.log(`HTML length: ${html.length} characters`)
  
  // Extract basic metadata
  const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/)
  const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/)
  const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/)
  
  console.log('\n📊 Extracted metadata:')
  console.log(`Title: ${titleMatch ? titleMatch[1] : 'Not found'}`)
  console.log(`Description: ${descriptionMatch ? descriptionMatch[1].substring(0, 100) + '...' : 'Not found'}`)
  console.log(`Image: ${imageMatch ? 'Found' : 'Not found'}`)
  
  // Look for Hashnode data
  const hashnodeDataMatch = html.match(/window\.__NEXT_DATA__\s*=\s*({.*?});/s)
  if (hashnodeDataMatch) {
    console.log('\n🎯 Found Hashnode Next.js data!')
    try {
      const data = JSON.parse(hashnodeDataMatch[1])
      if (data.props && data.props.pageProps && data.props.pageProps.post) {
        const post = data.props.pageProps.post
        console.log('\n✅ Successfully extracted post data:')
        console.log(`📝 Title: ${post.title}`)
        console.log(`📄 Brief: ${post.brief}`)
        console.log(`👤 Author: ${post.author?.name}`)
        console.log(`📅 Published: ${post.publishedAt}`)
        console.log(`⏱️ Reading time: ${post.readTimeInMinutes} min`)
        console.log(`🏷️ Tags: ${post.tags?.map(t => t.name).join(', ')}`)
        console.log(`🖼️ Cover image: ${post.coverImage?.url ? 'Yes' : 'No'}`)
      }
    } catch (e) {
      console.log('❌ Error parsing Hashnode data:', e.message)
    }
  } else {
    console.log('\n❌ No Hashnode Next.js data found')
  }
})
.catch(error => {
  console.log('❌ Error:', error.message)
})
