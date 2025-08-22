// Test script to manually trigger GitHub rich preview
// Run this in the browser console on your Link4Coders dashboard

async function testGitHubPreview() {
  const linkId = '2b82b644-a7ad-4ccb-87ee-b9ded76ca2c2'; // IntegratePDF GitHub link
  
  try {
    console.log('🔄 Testing GitHub rich preview for link:', linkId);
    
    // Trigger preview refresh
    const response = await fetch('/api/links/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ linkId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Preview refresh result:', result);
    
    if (result.success && result.metadata) {
      console.log('🎉 GitHub metadata fetched successfully!');
      console.log('Repository:', result.metadata.title);
      console.log('Description:', result.metadata.description);
      console.log('Stars:', result.metadata.stars);
      console.log('Forks:', result.metadata.forks);
      console.log('Language:', result.metadata.language);
      console.log('Owner:', result.metadata.owner?.login);
    } else {
      console.error('❌ Preview fetch failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Run the test
testGitHubPreview();
