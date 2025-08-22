// Debug script for Hashnode GraphQL API
// Test different query approaches

const testUrl = 'https://habibblog.hashnode.dev/unleash-javascript-magic-with-these-epic-one-liners'

async function testHashnodeQueries() {
  console.log('🔍 Testing Hashnode GraphQL API approaches...\n')
  
  const slug = 'unleash-javascript-magic-with-these-epic-one-liners'
  
  // Test 1: Simple post query by slug
  console.log('📝 Test 1: Simple post query by slug')
  const query1 = `
    query GetPost($slug: String!) {
      post(slug: $slug) {
        id
        title
        brief
        url
      }
    }
  `
  
  await testQuery(query1, { slug }, 'Test 1')
  
  // Test 2: Try with publication query
  console.log('\n📝 Test 2: Publication-based query')
  const query2 = `
    query GetPublication($host: String!) {
      publication(host: $host) {
        id
        title
        posts(first: 10) {
          edges {
            node {
              id
              title
              brief
              slug
              url
            }
          }
        }
      }
    }
  `
  
  await testQuery(query2, { host: 'habibblog.hashnode.dev' }, 'Test 2')
  
  // Test 3: Try web scraping as fallback
  console.log('\n📝 Test 3: Web scraping fallback')
  await testWebScraping(testUrl)
}

async function testQuery(query, variables, testName) {
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Link4Coders/1.0'
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log(`   ✅ ${testName} successful:`)
      console.log('   Response:', JSON.stringify(result, null, 2))
    } else {
      const errorText = await response.text()
      console.log(`   ❌ ${testName} failed:`)
      console.log('   Error:', errorText)
    }
  } catch (error) {
    console.log(`   ❌ ${testName} error:`, error.message)
  }
}

async function testWebScraping(url) {
  try {
    console.log('   Fetching HTML content...')
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (response.ok) {
      const html = await response.text()
      
      // Extract metadata using various approaches
      const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) ||
                        html.match(/<meta name="twitter:title" content="([^"]*)"/) ||
                        html.match(/<title[^>]*>([^<]*)<\/title>/)
      
      const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/) ||
                              html.match(/<meta name="twitter:description" content="([^"]*)"/) ||
                              html.match(/<meta name="description" content="([^"]*)"/)
      
      const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/) ||
                        html.match(/<meta name="twitter:image" content="([^"]*)"/)
      
      const authorMatch = html.match(/<meta name="author" content="([^"]*)"/) ||
                         html.match(/"author":\s*{\s*"name":\s*"([^"]*)"/) ||
                         html.match(/by\s+([^|,\n]+)/i)
      
      // Look for Hashnode-specific data
      const hashnodeDataMatch = html.match(/window\.__NEXT_DATA__\s*=\s*({.*?});/s)
      let hashnodeData = null
      
      if (hashnodeDataMatch) {
        try {
          hashnodeData = JSON.parse(hashnodeDataMatch[1])
          console.log('   📊 Found Hashnode data structure')
        } catch (e) {
          console.log('   ⚠️ Could not parse Hashnode data')
        }
      }
      
      console.log('   ✅ Web scraping successful:')
      console.log(`   📝 Title: ${titleMatch ? titleMatch[1] : 'Not found'}`)
      console.log(`   📄 Description: ${descriptionMatch ? descriptionMatch[1].substring(0, 100) + '...' : 'Not found'}`)
      console.log(`   🖼️ Image: ${imageMatch ? 'Found' : 'Not found'}`)
      console.log(`   👤 Author: ${authorMatch ? authorMatch[1] : 'Not found'}`)
      console.log(`   📊 Hashnode data: ${hashnodeData ? 'Found' : 'Not found'}`)
      
      // If we found Hashnode data, try to extract post info
      if (hashnodeData && hashnodeData.props && hashnodeData.props.pageProps) {
        console.log('   🔍 Analyzing Hashnode page data...')
        const pageProps = hashnodeData.props.pageProps
        
        if (pageProps.post) {
          console.log('   ✅ Found post data in Hashnode structure:')
          console.log(`      Title: ${pageProps.post.title || 'N/A'}`)
          console.log(`      Brief: ${pageProps.post.brief || 'N/A'}`)
          console.log(`      Author: ${pageProps.post.author?.name || 'N/A'}`)
          console.log(`      Published: ${pageProps.post.publishedAt || 'N/A'}`)
          console.log(`      Reading time: ${pageProps.post.readTimeInMinutes || 'N/A'} min`)
          console.log(`      Tags: ${pageProps.post.tags?.length || 0} tags`)
        }
      }
      
    } else {
      console.log(`   ❌ Web scraping failed: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Web scraping error:`, error.message)
  }
}

// Run the tests
testHashnodeQueries().catch(console.error)
