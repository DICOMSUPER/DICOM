// Simple API test script
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPatientAPI() {
  console.log('Testing Patient API...\n');

  try {
    // Test 1: Get patient stats
    console.log('1. Testing GET /patients/stats');
    const statsResponse = await axios.get(`${API_BASE}/patients/stats`);
    console.log('✅ Stats API working:', statsResponse.data);
  } catch (error) {
    console.log('❌ Stats API failed:', error.message);
  }

  try {
    // Test 2: Search patients by name
    console.log('\n2. Testing GET /patients/search?q=test');
    const searchResponse = await axios.get(`${API_BASE}/patients/search?q=test&limit=10`);
    console.log('✅ Search API working:', searchResponse.data);
  } catch (error) {
    console.log('❌ Search API failed:', error.message);
  }

  try {
    // Test 3: Get paginated patients
    console.log('\n3. Testing GET /patients/paginated?page=1&limit=10');
    const paginatedResponse = await axios.get(`${API_BASE}/patients/paginated?page=1&limit=10`);
    console.log('✅ Paginated API working:', paginatedResponse.data);
  } catch (error) {
    console.log('❌ Paginated API failed:', error.message);
  }

  try {
    // Test 4: Create a test patient
    console.log('\n4. Testing POST /patients (create patient)');
    const testPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      phoneNumber: '1234567890',
      address: '123 Test St',
      bloodType: 'O_POSITIVE',
      insuranceNumber: 'INS123456'
    };
    
    const createResponse = await axios.post(`${API_BASE}/patients`, testPatient);
    console.log('✅ Create API working:', createResponse.data);
    
    // Test 5: Get the created patient
    if (createResponse.data && createResponse.data.id) {
      console.log('\n5. Testing GET /patients/:id');
      const getResponse = await axios.get(`${API_BASE}/patients/${createResponse.data.id}`);
      console.log('✅ Get by ID API working:', getResponse.data);
    }
  } catch (error) {
    console.log('❌ Create/Get API failed:', error.message);
  }
}

// Run the test
testPatientAPI().catch(console.error);
