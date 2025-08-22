// Manual test to trigger GitHub preview refresh
// This simulates what happens when the API is called

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGitHubPreviewRefresh() {
  const linkId = '2b82b644-a7ad-4ccb-87ee-b9ded76ca2c2';
  const url = 'https://github.com/Habib7442/integratePDF';
  
  try {
    console.log('🔍 Testing GitHub preview refresh...');
    console.log('Link ID:', linkId);
    console.log('URL:', url);
    
    // Test GitHub API directly
    console.log('\n📡 Testing GitHub API...');
    
    const response = await fetch('https://api.github.com/repos/Habib7442/integratePDF', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Link4Coders/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API failed: ${response.status} ${response.statusText}`);
    }
    
    const repoData = await response.json();
    
    console.log('✅ GitHub API Response:');
    console.log('- Repository:', repoData.name);
    console.log('- Description:', repoData.description);
    console.log('- Stars:', repoData.stargazers_count);
    console.log('- Forks:', repoData.forks_count);
    console.log('- Language:', repoData.language);
    console.log('- Owner:', repoData.owner.login);
    console.log('- Avatar:', repoData.owner.avatar_url);
    
    // Create metadata object
    const metadata = {
      type: 'github_repo',
      repo_name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language,
      license: repoData.license?.name || null,
      topics: repoData.topics || [],
      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      owner: {
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatar_url,
        html_url: repoData.owner.html_url
      },
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      homepage: repoData.homepage,
      size: repoData.size,
      default_branch: repoData.default_branch,
      open_issues_count: repoData.open_issues_count,
      archived: repoData.archived,
      disabled: repoData.disabled,
      private: repoData.private
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
    console.log('- Preview Status:', updatedLink.preview_status);
    console.log('- Fetched At:', updatedLink.preview_fetched_at);
    console.log('- Metadata Type:', updatedLink.metadata?.type);
    console.log('- Repository Name:', updatedLink.metadata?.repo_name);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testGitHubPreviewRefresh()
  .then(success => {
    console.log(success ? '\n🎉 Test completed successfully!' : '\n💥 Test failed!');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
