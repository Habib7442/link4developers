// Script to run the rich preview database migration
// This applies the schema changes needed for rich link previews

import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  try {
    console.log('🚀 Starting rich preview migration...')

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '002_rich_previews_schema.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error)
          throw error
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`)
      } catch (error) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, statement)
        throw error
      }
    }

    console.log('🎉 Rich preview migration completed successfully!')
    
    // Test the new functions
    console.log('🧪 Testing new database functions...')
    
    // Test needs_preview_refresh function
    const { data: testRefresh, error: refreshError } = await supabase
      .rpc('needs_preview_refresh', { link_id: '00000000-0000-0000-0000-000000000000' })
    
    if (refreshError) {
      console.warn('⚠️ Warning: Could not test needs_preview_refresh function:', refreshError)
    } else {
      console.log('✅ needs_preview_refresh function is working')
    }

    console.log('✨ Migration and tests completed!')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Alternative approach using direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Starting rich preview migration (direct approach)...')

    // Add new columns
    console.log('📝 Adding new columns...')
    
    const alterStatements = [
      `ALTER TABLE user_links ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'contact' 
       CHECK (category IN ('personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom'))`,
      
      `ALTER TABLE user_links ADD COLUMN IF NOT EXISTS preview_fetched_at TIMESTAMP WITH TIME ZONE`,
      
      `ALTER TABLE user_links ADD COLUMN IF NOT EXISTS preview_expires_at TIMESTAMP WITH TIME ZONE`,
      
      `ALTER TABLE user_links ADD COLUMN IF NOT EXISTS preview_status TEXT DEFAULT 'pending' 
       CHECK (preview_status IN ('pending', 'success', 'failed', 'expired'))`
    ]

    for (const statement of alterStatements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error) {
        console.error('❌ Error executing ALTER statement:', error)
        throw error
      }
    }

    console.log('✅ Columns added successfully')

    // Create indexes
    console.log('📝 Creating indexes...')
    
    const indexStatements = [
      `CREATE INDEX IF NOT EXISTS idx_user_links_category ON user_links(user_id, category)`,
      `CREATE INDEX IF NOT EXISTS idx_user_links_preview_status ON user_links(preview_status)`,
      `CREATE INDEX IF NOT EXISTS idx_user_links_preview_expires ON user_links(preview_expires_at) WHERE preview_expires_at IS NOT NULL`
    ]

    for (const statement of indexStatements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error) {
        console.error('❌ Error creating index:', error)
        throw error
      }
    }

    console.log('✅ Indexes created successfully')
    console.log('🎉 Migration completed!')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Check if we're running this script directly
if (require.main === module) {
  console.log('🔧 Rich Preview Database Migration')
  console.log('===================================')
  
  // Try direct approach first (simpler)
  runMigrationDirect()
    .then(() => {
      console.log('✨ All done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export { runMigration, runMigrationDirect }
