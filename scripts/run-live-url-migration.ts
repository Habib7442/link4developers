// Script to run the GitHub Projects Live URL migration
// This applies the schema changes needed for live project URLs

import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

async function runLiveUrlMigration() {
  try {
    console.log('🚀 Starting GitHub Projects Live URL migration...')

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '009_github_project_live_url.sql')
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

    console.log('🎉 GitHub Projects Live URL migration completed successfully!')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Alternative approach using direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Starting GitHub Projects Live URL migration (direct approach)...')

    // Add live_project_url column
    console.log('📝 Adding live_project_url column...')
    
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      sql: `ALTER TABLE user_links ADD COLUMN IF NOT EXISTS live_project_url TEXT;`
    })
    
    if (alterError) {
      console.error('❌ Error adding column:', alterError)
      throw alterError
    }

    console.log('✅ Column added successfully')

    // Add URL validation constraint
    console.log('📝 Adding URL validation constraint...')
    
    const { error: constraintError } = await supabase.rpc('exec_sql', { 
      sql: `ALTER TABLE user_links ADD CONSTRAINT IF NOT EXISTS check_live_project_url 
            CHECK (live_project_url IS NULL OR live_project_url ~ '^https?://.*');`
    })
    
    if (constraintError) {
      console.error('❌ Error adding constraint:', constraintError)
      throw constraintError
    }

    console.log('✅ Constraint added successfully')

    // Create index
    console.log('📝 Creating index...')
    
    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: `CREATE INDEX IF NOT EXISTS idx_user_links_live_project_url 
            ON user_links(live_project_url) 
            WHERE live_project_url IS NOT NULL AND category = 'projects';`
    })
    
    if (indexError) {
      console.error('❌ Error creating index:', indexError)
      throw indexError
    }

    console.log('✅ Index created successfully')

    // Add column comment
    console.log('📝 Adding column comment...')
    
    const { error: commentError } = await supabase.rpc('exec_sql', { 
      sql: `COMMENT ON COLUMN user_links.live_project_url IS 'Optional live project URL for GitHub projects (e.g., deployed app, demo site)';`
    })
    
    if (commentError) {
      console.error('❌ Error adding comment:', commentError)
      throw commentError
    }

    console.log('✅ Comment added successfully')
    console.log('🎉 Migration completed!')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Check if we're running this script directly
if (require.main === module) {
  console.log('🔧 GitHub Projects Live URL Migration')
  console.log('====================================')
  
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

export { runLiveUrlMigration, runMigrationDirect }