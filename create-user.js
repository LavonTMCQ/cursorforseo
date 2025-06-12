require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Simple CUID-like ID generator
function generateId() {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `c${timestamp}${randomPart}`
}

async function createTestUser() {
  try {
    console.log('🔍 Creating test user...')

    // Create a user that matches the Google OAuth user
    const userId = generateId()
    console.log('🆔 Generated user ID:', userId)

    const now = new Date().toISOString()
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: 'quisesyeklimye@gmail.com',
          name: 'Q LIMYE',
          image: null,
          emailVerified: now,
          planType: 'STARTER',
          createdAt: now,
          updatedAt: now
        }
      ])
      .select()
    
    if (error) {
      console.error('❌ Error creating user:', error)
    } else {
      console.log('✅ User created successfully:', user)
    }
    
    // Check user count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
    
    console.log(`📊 Total users in database: ${count}`)
    
  } catch (error) {
    console.error('❌ Failed to create user:', error)
  }
}

createTestUser()
