require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteTestUser() {
  try {
    console.log('🗑️ Deleting test user...')
    
    // Delete the manually created user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', 'quisesyeklimye@gmail.com')
    
    if (error) {
      console.error('❌ Error deleting user:', error)
    } else {
      console.log('✅ User deleted successfully')
    }
    
    // Check user count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
    
    console.log(`📊 Total users in database: ${count}`)
    
  } catch (error) {
    console.error('❌ Failed to delete user:', error)
  }
}

deleteTestUser()
