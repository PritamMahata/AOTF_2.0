/**
 * Ad Server-Time Auto-Scheduling Test Script
 * 
 * This script helps verify the ad auto-activation/expiration system.
 * Run this in your browser's console on the admin ads page.
 */

// Test 1: Check server time sync
async function testServerTimeSync() {
  console.log('🧪 Test 1: Server Time Sync');
  const response = await fetch('/api/ad/sync-status');
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Server time:', new Date(data.serverTime).toLocaleString());
    console.log('✅ Status counts:', data.statusCounts);
  } else {
    console.error('❌ Failed to sync:', data.error);
  }
  return data;
}

// Test 2: Create a scheduled ad (future start date)
async function testScheduledAd() {
  console.log('🧪 Test 2: Create Scheduled Ad');
  
  // Set start date to 1 minute in the future
  const startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() + 1);
  
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 1);
  
  const adData = {
    title: 'Test Scheduled Ad',
    imageUrl: 'https://via.placeholder.com/300x250',
    link: 'https://example.com',
    status: 'active', // Should be changed to 'scheduled' automatically
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
  
  const response = await fetch('/api/ad/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Ad created with status:', data.ad.status);
    console.log('Expected: scheduled, Got:', data.ad.status);
    console.log('Ad ID:', data.ad._id);
    return data.ad;
  } else {
    console.error('❌ Failed to create ad:', data.error);
  }
}

// Test 3: Verify active ads don't include scheduled/expired
async function testActiveAdsFiltering() {
  console.log('🧪 Test 3: Active Ads Filtering');
  
  const response = await fetch('/api/ad/active');
  const data = await response.json();
  
  if (data.success && data.ad) {
    console.log('✅ Got active ad:', data.ad.title);
    console.log('✅ Status:', data.ad.status);
    
    if (data.ad.status !== 'active') {
      console.error('❌ Expected active status, got:', data.ad.status);
    }
  } else {
    console.log('⚠️ No active ads available:', data.message);
  }
  
  return data;
}

// Test 4: Create an expired ad (past end date)
async function testExpiredAd() {
  console.log('🧪 Test 4: Create Expired Ad');
  
  // Set end date to yesterday
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  
  const adData = {
    title: 'Test Expired Ad',
    imageUrl: 'https://via.placeholder.com/300x250',
    link: 'https://example.com',
    status: 'active', // Should be changed to 'expired' automatically
    endDate: endDate.toISOString().split('T')[0]
  };
  
  const response = await fetch('/api/ad/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Ad created with status:', data.ad.status);
    console.log('Expected: expired, Got:', data.ad.status);
    console.log('Ad ID:', data.ad._id);
    return data.ad;
  } else {
    console.error('❌ Failed to create ad:', data.error);
  }
}

// Test 5: Verify status synchronization
async function testStatusSync() {
  console.log('🧪 Test 5: Status Synchronization');
  
  // Get current ads
  const beforeSync = await fetch('/api/ad/manage');
  const beforeData = await beforeSync.json();
  
  console.log('📊 Before sync - Ad count:', beforeData.ads.length);
  
  // Trigger sync
  const syncResponse = await fetch('/api/ad/sync-status');
  const syncData = await syncResponse.json();
  
  console.log('✅ Sync completed');
  console.log('Status counts:', syncData.statusCounts);
  
  // Get ads after sync
  const afterSync = await fetch('/api/ad/manage');
  const afterData = await afterSync.json();
  
  console.log('📊 After sync - Ad count:', afterData.ads.length);
  
  // Compare statuses
  const statusChanges = afterData.ads.filter((ad) => {
    const before = beforeData.ads.find(b => b._id === ad._id);
    return before && before.status !== ad.status;
  });
  
  if (statusChanges.length > 0) {
    console.log('✅ Status changes detected:', statusChanges.length);
    statusChanges.forEach(ad => {
      console.log(`  - ${ad.title}: status changed`);
    });
  } else {
    console.log('ℹ️ No status changes needed');
  }
  
  return syncData;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Ad System Tests...\n');
  
  try {
    await testServerTimeSync();
    console.log('\n');
    
    await testScheduledAd();
    console.log('\n');
    
    await testExpiredAd();
    console.log('\n');
    
    await testActiveAdsFiltering();
    console.log('\n');
    
    await testStatusSync();
    console.log('\n');
    
    console.log('✅ All tests completed!');
    console.log('\nCleanup: Remember to delete test ads from the admin panel.');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Export test functions
if (typeof window !== 'undefined') {
  window.adTests = {
    runAll: runAllTests,
    testServerTimeSync,
    testScheduledAd,
    testExpiredAd,
    testActiveAdsFiltering,
    testStatusSync
  };
  
  console.log('✅ Ad tests loaded! Run tests with:');
  console.log('  window.adTests.runAll()          - Run all tests');
  console.log('  window.adTests.testServerTimeSync()  - Test server time');
  console.log('  window.adTests.testScheduledAd()     - Test scheduled ad creation');
  console.log('  window.adTests.testExpiredAd()       - Test expired ad creation');
  console.log('  window.adTests.testActiveAdsFiltering() - Test active ads filtering');
  console.log('  window.adTests.testStatusSync()      - Test status synchronization');
}
