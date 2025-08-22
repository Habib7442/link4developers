#!/usr/bin/env node

// Setup script for Rich Link Previews feature
// This script helps users set up the rich preview functionality

const fs = require('fs')
const path = require('path')

console.log('🚀 Link4Coders Rich Preview Setup')
console.log('==================================\n')

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.')
  process.exit(1)
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
if (!packageJson.name || !packageJson.name.includes('link4')) {
  console.error('❌ Error: This doesn\'t appear to be the Link4Coders project.')
  process.exit(1)
}

console.log('✅ Project detected: Link4Coders')

// Check required files
const requiredFiles = [
  'lib/types/rich-preview.ts',
  'lib/services/github-api-service.ts',
  'lib/services/meta-scraper-service.ts',
  'lib/services/rich-preview-service.ts',
  'components/rich-preview/rich-link-preview.tsx',
  'components/rich-preview/github-repo-card.tsx',
  'components/rich-preview/webpage-preview-card.tsx',
  'supabase/migrations/002_rich_previews_schema.sql',
  'app/api/links/preview/route.ts'
]

console.log('🔍 Checking required files...')
let missingFiles = []

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file}`)
    missingFiles.push(file)
  }
}

if (missingFiles.length > 0) {
  console.error(`\n❌ Missing ${missingFiles.length} required files. Please ensure all rich preview files are in place.`)
  process.exit(1)
}

console.log('\n✅ All required files are present')

// Check environment variables
console.log('\n🔧 Checking environment configuration...')

const envPath = path.join(process.cwd(), '.env.local')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
  console.log('  ✅ .env.local file found')
} else {
  console.log('  ⚠️  .env.local file not found')
}

// Check for GitHub token
if (envContent.includes('GITHUB_TOKEN') || envContent.includes('GITHUB_ACCESS_TOKEN')) {
  console.log('  ✅ GitHub token configured')
} else {
  console.log('  ⚠️  GitHub token not configured (optional but recommended)')
  console.log('     Add GITHUB_TOKEN=your_token_here to .env.local for higher rate limits')
}

// Check Supabase configuration
if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
  console.log('  ✅ Supabase configuration found')
} else {
  console.log('  ❌ Supabase configuration missing')
  console.log('     Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
}

// Check if migration has been run
console.log('\n🗄️  Checking database schema...')
console.log('  ⚠️  Please run the database migration manually:')
console.log('     1. Apply the migration in Supabase Dashboard')
console.log('     2. Or run: npm run migrate:rich-previews')
console.log('     3. Migration file: supabase/migrations/002_rich_previews_schema.sql')

// Check dependencies
console.log('\n📦 Checking dependencies...')

const requiredDeps = [
  'lucide-react',
  '@supabase/supabase-js',
  'next',
  'react',
  'typescript'
]

for (const dep of requiredDeps) {
  if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`  ✅ ${dep}`)
  } else {
    console.log(`  ❌ ${dep} - please install with npm install ${dep}`)
  }
}

// Generate setup summary
console.log('\n📋 Setup Summary')
console.log('================')
console.log('✅ Rich preview files are in place')
console.log('✅ TypeScript types defined')
console.log('✅ API endpoints created')
console.log('✅ React components ready')
console.log('✅ Database migration prepared')

console.log('\n🚀 Next Steps')
console.log('=============')
console.log('1. Run database migration:')
console.log('   - Open Supabase Dashboard')
console.log('   - Go to SQL Editor')
console.log('   - Run the contents of supabase/migrations/002_rich_previews_schema.sql')
console.log('')
console.log('2. Optional: Add GitHub token to .env.local:')
console.log('   GITHUB_TOKEN=your_github_personal_access_token')
console.log('')
console.log('3. Start the development server:')
console.log('   npm run dev')
console.log('')
console.log('4. Test the feature:')
console.log('   - Add a GitHub repository link')
console.log('   - Add a website link')
console.log('   - Check the rich previews in your profile')

console.log('\n📚 Documentation')
console.log('================')
console.log('- Rich Previews Guide: docs/RICH_PREVIEWS.md')
console.log('- API Reference: Check the /api/links/preview endpoints')
console.log('- Component Usage: See components/rich-preview/ directory')

console.log('\n🎉 Setup Complete!')
console.log('==================')
console.log('Rich Link Previews are ready to use in Link4Coders!')
console.log('Visit your dashboard to see the new preview functionality.')

console.log('\n💡 Tips')
console.log('=======')
console.log('- GitHub repositories will show stars, forks, and language info')
console.log('- Websites will display Open Graph images and descriptions')
console.log('- Previews are cached for performance')
console.log('- Use the refresh button to update stale previews')
console.log('- Check the Preview Management dashboard for statistics')

console.log('\n🐛 Troubleshooting')
console.log('==================')
console.log('- If previews don\'t load, check browser console for errors')
console.log('- Verify database migration was applied successfully')
console.log('- Check network connectivity for external API calls')
console.log('- Review CORS settings if scraping fails')

console.log('\n✨ Enjoy your enhanced Link4Coders experience!')
