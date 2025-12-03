// Quick test to check Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

console.log('Checking Supabase configuration...')
console.log('URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing')

if (supabaseUrl && supabaseAnonKey) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('\nTesting connection...')
  
  // Try to query a table (this will fail if tables don't exist, but connection will work)
  supabase.from('projects').select('count').limit(1)
    .then(() => {
      console.log('✓ Connection successful!')
      console.log('Note: If you see an error about tables, you need to run the migration.')
    })
    .catch((err) => {
      if (err.message.includes('relation') || err.message.includes('does not exist')) {
        console.log('✓ Connection works, but tables may not be set up yet.')
        console.log('Run the migration file: supabase/migrations/001_initial_schema.sql')
      } else {
        console.log('✗ Connection error:', err.message)
      }
    })
} else {
  console.log('\n✗ Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

