import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`URL: ${BASE_URL}${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🎬 Testing Smartflix API Endpoints...\n');
  
  // Test health endpoint
  await testEndpoint('/health', 'Health Check');
  
  // Test search endpoint
  await testEndpoint('/search?query=action movies', 'Search Movies');
  
  // Test recommendations endpoint
  await testEndpoint('/recommendations/1', 'Get Recommendations for Movie 1');
  
  // Test movies endpoint
  await testEndpoint('/movies', 'Get All Movies');
  
  console.log('\n✨ All tests completed!');
}

runTests(); 