import { TemplateConfig, TemplateId } from '@/lib/supabase'

// Template configurations for the 3 free MVP templates
export const TEMPLATE_CONFIGS: Record<TemplateId, TemplateConfig> = {
  'developer-dark': {
    id: 'developer-dark',
    name: 'Developer Dark',
    description: 'The classic dark theme perfect for developers. Clean, professional, and easy on the eyes.',
    category: 'free',
    preview_image: '/templates/developer-dark.png',
    features: [
      'Dark theme optimized for developers',
      'Glassmorphic design elements',
      'Professional layout',
      'Excellent readability',
      'Mobile responsive'
    ],
    color_scheme: {
      primary: '#54E0FF',
      secondary: '#29ADFF',
      accent: '#67E8F9',
      background: '#18181a',
      surface: 'rgba(0, 0, 0, 0.20)',
      text_primary: '#ffffff',
      text_secondary: '#7a7a83',
      border: '#33373b'
    },
    layout: {
      header_style: 'centered',
      link_style: 'cards',
      spacing: 'normal',
      avatar_size: 'large'
    },
    typography: {
      heading_font: 'Sharp Grotesk',
      body_font: 'Sharp Grotesk',
      heading_size: '32px',
      body_size: '16px'
    }
  },

  'minimalist-light': {
    id: 'minimalist-light',
    name: 'Minimalist Light',
    description: 'Clean and minimal light theme that puts your content first. Perfect for a professional look.',
    category: 'free',
    preview_image: '/templates/minimalist-light.png',
    features: [
      'Clean light theme',
      'Minimal design approach',
      'Content-focused layout',
      'High contrast for accessibility',
      'Professional appearance'
    ],
    color_scheme: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f8fafc',
      text_primary: '#1e293b',
      text_secondary: '#64748b',
      border: '#e2e8f0'
    },
    layout: {
      header_style: 'centered',
      link_style: 'buttons',
      spacing: 'spacious',
      avatar_size: 'medium'
    },
    typography: {
      heading_font: 'Sharp Grotesk',
      body_font: 'Sharp Grotesk',
      heading_size: '28px',
      body_size: '15px'
    }
  },

  'github-focus': {
    id: 'github-focus',
    name: 'GitHub Focus',
    description: 'Designed for open-source developers. Highlights your GitHub activity and contributions.',
    category: 'free',
    preview_image: '/templates/github-focus.png',
    features: [
      'GitHub-inspired design',
      'Contribution graph styling',
      'Repository showcase',
      'Open source focused',
      'Developer-friendly colors'
    ],
    color_scheme: {
      primary: '#238636',
      secondary: '#1f6f2a',
      accent: '#2ea043',
      background: '#0d1117',
      surface: '#161b22',
      text_primary: '#f0f6fc',
      text_secondary: '#8b949e',
      border: '#30363d'
    },
    layout: {
      header_style: 'left-aligned',
      link_style: 'list',
      spacing: 'compact',
      avatar_size: 'medium'
    },
    typography: {
      heading_font: 'Sharp Grotesk',
      body_font: 'Sharp Grotesk',
      heading_size: '24px',
      body_size: '14px'
    }
  }
}

// Helper functions for template management
export const getTemplateConfig = (templateId: TemplateId): TemplateConfig => {
  return TEMPLATE_CONFIGS[templateId]
}

export const getAllTemplates = (): TemplateConfig[] => {
  return Object.values(TEMPLATE_CONFIGS)
}

export const getFreeTemplates = (): TemplateConfig[] => {
  return getAllTemplates().filter(template => template.category === 'free')
}

export const getPremiumTemplates = (): TemplateConfig[] => {
  return getAllTemplates().filter(template => template.category === 'premium')
}

export const isValidTemplateId = (templateId: string): templateId is TemplateId => {
  return templateId in TEMPLATE_CONFIGS
}

export const getDefaultTemplateId = (): TemplateId => {
  return 'developer-dark'
}

// Template component mapping (will be used to dynamically load template components)
export const TEMPLATE_COMPONENTS = {
  'developer-dark': 'DeveloperDarkTemplate',
  'minimalist-light': 'MinimalistLightTemplate',
  'github-focus': 'GitHubFocusTemplate'
} as const

export type TemplateComponentName = typeof TEMPLATE_COMPONENTS[TemplateId]
