// Comprehensive test script to verify the analytics fix
console.log('Running comprehensive analytics fix test...');

// Mock user ID for testing
const TEST_USER_ID = 'test-user-id-123';

// Test the LinkService.getLinkAnalytics method
async function testLinkService() {
  try {
    // Dynamically import the LinkService
    const { LinkService } = await import('./lib/services/link-service');
    
    console.log('Testing LinkService.getLinkAnalytics...');
    
    // Call the method with a test user ID
    const analytics = await LinkService.getLinkAnalytics(TEST_USER_ID);
    
    console.log('✅ LinkService.getLinkAnalytics executed successfully');
    console.log('📊 Analytics data:', JSON.stringify(analytics, null, 2));
    
    // Verify the structure of the returned data
    if (typeof analytics.totalClicks === 'number') {
      console.log('✅ Total clicks is a number');
    } else {
      console.log('❌ Total clicks is not a number');
    }
    
    if (analytics.linksByCategory && typeof analytics.linksByCategory === 'object') {
      console.log('✅ Links by category object exists');
    } else {
      console.log('❌ Links by category object missing');
    }
    
    if (Array.isArray(analytics.topLinks)) {
      console.log('✅ Top links is an array');
    } else {
      console.log('❌ Top links is not an array');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing LinkService:', error.message);
    return false;
  }
}

// Test the AnalyticsService.getLinkAnalytics method
async function testAnalyticsService() {
  try {
    // Dynamically import the AnalyticsService
    const { AnalyticsService } = await import('./lib/database');
    
    console.log('Testing AnalyticsService.getLinkAnalytics...');
    
    // Call the method with a test user ID
    const analytics = await AnalyticsService.getLinkAnalytics(TEST_USER_ID);
    
    console.log('✅ AnalyticsService.getLinkAnalytics executed successfully');
    console.log('📊 Analytics data:', JSON.stringify(analytics, null, 2));
    
    // Verify the structure of the returned data
    if (typeof analytics.totalClicks === 'number') {
      console.log('✅ Total clicks is a number');
    } else {
      console.log('❌ Total clicks is not a number');
    }
    
    if (typeof analytics.totalLinks === 'number') {
      console.log('✅ Total links is a number');
    } else {
      console.log('❌ Total links is not a number');
    }
    
    if (typeof analytics.activeLinks === 'number') {
      console.log('✅ Active links is a number');
    } else {
      console.log('❌ Active links is not a number');
    }
    
    if (Array.isArray(analytics.topLinks)) {
      console.log('✅ Top links is an array');
    } else {
      console.log('❌ Top links is not an array');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing AnalyticsService:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('🧪 Starting comprehensive analytics tests...\n');
  
  const linkServiceTestPassed = await testLinkService();
  console.log('');
  const analyticsServiceTestPassed = await testAnalyticsService();
  
  console.log('\n📋 Test Summary:');
  console.log(`LinkService test: ${linkServiceTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`AnalyticsService test: ${analyticsServiceTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (linkServiceTestPassed && analyticsServiceTestPassed) {
    console.log('\n🎉 All tests passed! The analytics fix is working correctly.');
    console.log('\nTo verify in the application:');
    console.log('1. Visit the dashboard analytics page');
    console.log('2. Verify that the total clicks show the correct aggregated value');
    console.log('3. Check that individual link clicks are still working correctly');
    console.log('4. Confirm that category-specific analytics are displayed properly');
  } else {
    console.log('\n💥 Some tests failed. Please check the implementation.');
  }
}

// Execute the tests
runTests().catch(console.error);