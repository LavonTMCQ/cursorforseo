const { default: fetch } = require('node-fetch')

async function testTRPCEndpoints() {
  try {
    console.log('🔍 Testing tRPC endpoints...')
    
    // Test user stats endpoint (should work with session)
    const statsResponse = await fetch('http://localhost:3000/api/trpc/user.getStats?batch=1&input=%7B%7D', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const statsData = await statsResponse.text()
    console.log('📊 User stats response:', statsData)
    
    // Test project getAll endpoint
    const projectsResponse = await fetch('http://localhost:3000/api/trpc/project.getAll?batch=1&input=%7B%7D', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const projectsData = await projectsResponse.text()
    console.log('📁 Projects response:', projectsData)
    
  } catch (error) {
    console.error('❌ tRPC test failed:', error)
  }
}

testTRPCEndpoints()
