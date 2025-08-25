import { LinkCategory } from '@/lib/domain/entities'

/**
 * Link categories configuration 
 */
export const LINK_CATEGORIES = {
  personal: {
    label: 'Personal',
    description: 'Personal website, resume, CV, portfolio, bio page',
    icon: 'User',
    maxLinks: 5
  },
  projects: {
    label: 'Projects',
    description: 'GitHub repositories, project demos, case studies',
    icon: 'Github',
    maxLinks: 10
  },
  blogs: {
    label: 'Blogs',
    description: 'Blog posts, articles, tutorials, documentation',
    icon: 'BookOpen',
    maxLinks: 8
  },
  achievements: {
    label: 'Achievements',
    description: 'Awards, certifications, publications, speaking',
    icon: 'Award',
    maxLinks: 6
  },
  contact: {
    label: 'Contact',
    description: 'Email, phone, social media profiles',
    icon: 'Mail',
    maxLinks: 4
  },
  custom: {
    label: 'Custom Links',
    description: 'Other important links, resources, tools',
    icon: 'Link',
    maxLinks: 5
  },
  social: {
    label: 'Social Media',
    description: 'Twitter, LinkedIn, Instagram, YouTube',
    icon: 'Share2',
    maxLinks: 6
  }
} as const

/**
 * Platform configurations for social media and other services
 */
export const PLATFORM_CONFIGS = {
  github: { icon: 'Github', category: 'projects' as LinkCategory, baseUrl: 'https://github.com/' },
  linkedin: { icon: 'Linkedin', category: 'social' as LinkCategory, baseUrl: 'https://linkedin.com/in/' },
  twitter: { icon: 'Twitter', category: 'social' as LinkCategory, baseUrl: 'https://twitter.com/' },
  'dev-to': { icon: 'BookOpen', category: 'blogs' as LinkCategory, baseUrl: 'https://dev.to/' },
  medium: { icon: 'BookOpen', category: 'blogs' as LinkCategory, baseUrl: 'https://medium.com/@' },
  hashnode: { icon: 'BookOpen', category: 'blogs' as LinkCategory, baseUrl: 'https://hashnode.com/@' },
  stackoverflow: { icon: 'MessageSquare', category: 'achievements' as LinkCategory, baseUrl: 'https://stackoverflow.com/users/' },
  leetcode: { icon: 'Code', category: 'achievements' as LinkCategory, baseUrl: 'https://leetcode.com/' },
  portfolio: { icon: 'Globe', category: 'projects' as LinkCategory, baseUrl: '' },
  email: { icon: 'Mail', category: 'contact' as LinkCategory, baseUrl: 'mailto:' },
  website: { icon: 'Globe', category: 'contact' as LinkCategory, baseUrl: '' }
} as const

/**
 * Utility function to check if a category is valid
 */
export function isValidLinkCategory(category: string): category is LinkCategory {
  return Object.keys(LINK_CATEGORIES).includes(category as LinkCategory)
}

/**
 * Default order for link categories
 */
export const DEFAULT_CATEGORY_ORDER: LinkCategory[] = [
  'personal',
  'projects',
  'blogs',
  'achievements',
  'contact', 
  'custom',
  'social'
]