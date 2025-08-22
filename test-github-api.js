// Test GitHub API directly
const { GitHubApiService } = require('./lib/services/github-api-service.ts');

async function testGitHubAPI() {
  const testUrl = 'https://github.com/Habib7442/integratePDF';
  
  try {
    console.log('🔍 Testing GitHub API for:', testUrl);
    
    const metadata = await GitHubApiService.fetchRepoMetadata(testUrl);
    
    console.log('✅ GitHub API Response:');
    console.log('Repository:', metadata.repo_name);
    console.log('Description:', metadata.description);
    console.log('Stars:', metadata.stars);
    console.log('Forks:', metadata.forks);
    console.log('Language:', metadata.language);
    console.log('Owner:', metadata.owner.login);
    console.log('Avatar:', metadata.owner.avatar_url);
    
    return metadata;
  } catch (error) {
    console.error('❌ GitHub API Test Failed:', error);
    return null;
  }
}

testGitHubAPI();
