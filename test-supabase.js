require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Service Key:', supabaseKey ? 'Present' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test user count
    const { data: users, error: userError, count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
    
    if (userError) {
      console.error('❌ User query error:', userError)
    } else {
      console.log(`📊 Users in database: ${userCount}`)
      console.log('👥 Users:', users)
    }
    
    // Test project count
    const { data: projects, error: projectError, count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
    
    if (projectError) {
      console.error('❌ Project query error:', projectError)
    } else {
      console.log(`📊 Projects in database: ${projectCount}`)
      console.log('📁 Projects:', projects)
    }
    
    console.log('🎉 Supabase test completed successfully!')
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error)
  }
}

testSupabase()
