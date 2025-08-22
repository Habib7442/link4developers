// Manual test to trigger Medium blog preview refresh
// This simulates what happens when the API is called

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMediumPreviewRefresh() {
  const linkId = 'c512b730-2efd-4fb7-8e5a-ed9b3d0030f2';
  const url = 'https://habibtanwir1906.medium.com/the-art-of-debugging-navigating-javascript-glitches-like-a-pro-29c81831be5f';
  
  try {
    console.log('🔍 Testing Medium blog preview refresh...');
    console.log('Link ID:', linkId);
    console.log('URL:', url);
    
    // Test Medium scraping directly
    console.log('\n📡 Testing Medium scraping...');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Link4Coders/1.0 (compatible; blog preview bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Medium fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Extract metadata using basic parsing (simplified version)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                     html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
    const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i) ||
                       html.match(/<meta[^>]*property="article:author"[^>]*content="([^"]*)"[^>]*>/i);
    const dateMatch = html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i);
    
    const title = titleMatch ? titleMatch[1].trim() : 'Medium Article';
    const description = descMatch ? descMatch[1].trim() : '';
    const image = imageMatch ? imageMatch[1].trim() : '';
    const author = authorMatch ? authorMatch[1].trim() : '';
    const publishedDate = dateMatch ? dateMatch[1].trim() : '';
    
    console.log('✅ Medium Scraping Results:');
    console.log('- Title:', title);
    console.log('- Description:', description.substring(0, 100) + '...');
    console.log('- Image:', image);
    console.log('- Author:', author);
    console.log('- Published:', publishedDate);
    
    // Create metadata object
    const metadata = {
      type: 'blog_post',
      title: title,
      description: description,
      image: image,
      author: {
        name: author || 'Unknown Author',
        avatar: null,
        url: null
      },
      published_at: publishedDate || new Date().toISOString(),
      platform: 'medium',
      url: url,
      reading_time: null,
      tags: []
    };
    
    console.log('\n💾 Updating database...');
    
    // Update the database using the function
    const { error } = await supabase.rpc('update_link_preview', {
      p_link_id: linkId,
      p_metadata: metadata,
      p_status: 'success'
    });
    
    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
    
    console.log('✅ Database updated successfully!');
    
    // Verify the update
    const { data: updatedLink, error: fetchError } = await supabase
      .from('user_links')
      .select('metadata, preview_status, preview_fetched_at')
      .eq('id', linkId)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to verify update: ${fetchError.message}`);
    }
    
    console.log('\n🔍 Verification:');
    console.log('- Status:', updatedLink.preview_status);
    console.log('- Fetched at:', updatedLink.preview_fetched_at);
    console.log('- Metadata type:', updatedLink.metadata?.type);
    console.log('- Metadata title:', updatedLink.metadata?.title);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Mark as failed in database
    try {
      await supabase.rpc('mark_preview_failed', {
        p_link_id: linkId,
        p_error_message: error.message
      });
      console.log('💾 Marked preview as failed in database');
    } catch (dbError) {
      console.error('❌ Failed to update database:', dbError.message);
    }
  }
}

// Run the test
testMediumPreviewRefresh();
