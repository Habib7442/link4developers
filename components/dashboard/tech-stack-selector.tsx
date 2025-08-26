'use client'

import { useState } from 'react'
import Image from 'next/image'
import techStacksData from '@/assets/techstacks.json'

interface TechStackSelectorProps {
  selectedTechStacks: string[]
  onChange: (selectedTechStacks: string[]) => void
}

export function TechStackSelector({ selectedTechStacks, onChange }: TechStackSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('frontend')

  // Get unique categories from tech stacks
  const categories = techStacksData.categories

  // Filter tech stacks by category
  const filteredTechStacks = techStacksData.techStacks.filter(
    (tech) => tech.category === selectedCategory
  )

  // Toggle tech stack selection
  const handleTechStackToggle = (techId: string) => {
    if (selectedTechStacks.includes(techId)) {
      onChange(selectedTechStacks.filter((id) => id !== techId))
    } else {
      onChange([...selectedTechStacks, techId])
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected Tech Stacks Display */}
      {selectedTechStacks.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-[#28282b] rounded-lg">
          {selectedTechStacks.map((techId) => {
            const tech = techStacksData.techStacks.find(t => t.id === techId)
            return tech ? (
              <div 
                key={tech.id} 
                className="flex items-center gap-2 px-3 py-1 bg-[#33373b] rounded-full"
              >
                <Image 
                  src={tech.imagePath} 
                  alt={tech.name} 
                  width={20} 
                  height={20} 
                  className="rounded-sm"
                />
                <span className="text-[12px] text-white">{tech.name}</span>
                <button 
                  onClick={() => handleTechStackToggle(tech.id)}
                  className="text-[#7a7a83] hover:text-white"
                >
                  ×
                </button>
              </div>
            ) : null
          })}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 text-[12px] rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-[#54E0FF] text-[#18181a]'
                : 'bg-[#28282b] text-[#7a7a83] hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Tech Stacks Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {filteredTechStacks.map((tech) => (
          <button
            key={tech.id}
            onClick={() => handleTechStackToggle(tech.id)}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              selectedTechStacks.includes(tech.id)
                ? 'border-[#54E0FF] bg-[#54E0FF]/10'
                : 'border-[#33373b] bg-[#28282b] hover:border-[#54E0FF]/50'
            }`}
          >
            <div className="relative w-8 h-8 mb-2">
              <Image 
                src={tech.imagePath} 
                alt={tech.name} 
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <span className="text-[11px] text-center text-white truncate w-full">
              {tech.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}