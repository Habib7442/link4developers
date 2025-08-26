const fs = require('fs')
const path = require('path')

// Read and parse the techstacks.json file
const techStacksPath = path.join(__dirname, '..', 'assets', 'techstacks.json')
const techStacksData = JSON.parse(fs.readFileSync(techStacksPath, 'utf8'))

console.log('✅ Tech stacks JSON file loaded successfully')

// Verify structure
if (!techStacksData.techStacks || !Array.isArray(techStacksData.techStacks)) {
  console.error('❌ techStacks array is missing or not an array')
  process.exit(1)
}

if (!techStacksData.categories || !Array.isArray(techStacksData.categories)) {
  console.error('❌ categories array is missing or not an array')
  process.exit(1)
}

console.log(`✅ Found ${techStacksData.techStacks.length} tech stacks`)
console.log(`✅ Found ${techStacksData.categories.length} categories`)

// Verify each tech stack has required properties
for (const tech of techStacksData.techStacks) {
  if (!tech.id || !tech.name || !tech.imagePath || !tech.category || !tech.color) {
    console.error(`❌ Tech stack missing required properties:`, tech)
    process.exit(1)
  }
}

console.log('✅ All tech stacks have required properties')

// Verify each category has required properties
for (const category of techStacksData.categories) {
  if (!category.id || !category.name) {
    console.error(`❌ Category missing required properties:`, category)
    process.exit(1)
  }
}

console.log('✅ All categories have required properties')

// Verify all tech stacks reference valid categories
const categoryIds = new Set(techStacksData.categories.map(c => c.id))
for (const tech of techStacksData.techStacks) {
  if (!categoryIds.has(tech.category)) {
    console.error(`❌ Tech stack references invalid category:`, tech)
    process.exit(1)
  }
}

console.log('✅ All tech stacks reference valid categories')

console.log('🎉 Tech stacks JSON file is valid!')