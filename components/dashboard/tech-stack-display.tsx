'use client'

import Image from 'next/image'
import techStacksData from '@/assets/techstacks.json'

interface TechStackDisplayProps {
  techStackIds: string[]
  align?: 'center' | 'left' | 'right'
}

export function TechStackDisplay({ techStackIds, align = 'center' }: TechStackDisplayProps) {
  if (!techStackIds || techStackIds.length === 0) {
    return null
  }

  // Filter tech stacks to show only selected ones
  const selectedTechStacks = techStacksData.techStacks.filter(tech => 
    techStackIds.includes(tech.id)
  )

  return (
    <div className={`flex flex-wrap gap-1.5 ${align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'}`}>
      {selectedTechStacks.map((tech) => (
        <div 
          key={tech.id} 
          className="flex items-center gap-1.5 px-2 py-0.5 bg-[#28282b] rounded-full border border-[#33373b]"
        >
          <div className="relative w-3 h-3">
            <Image 
              src={tech.imagePath} 
              alt={tech.name} 
              fill
              sizes="12px"
              className="object-contain"
            />
          </div>
          <span className="text-[10px] text-white">{tech.name}</span>
        </div>
      ))}
    </div>
  )
}
