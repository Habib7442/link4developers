import { TemplateConfig, TemplateId } from '@/lib/supabase'

// Template configurations for the free MVP templates + premium GTA 6 theme
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
    description: 'Clean and elegant light theme with excellent contrast and professional styling. Perfect for showcasing your work.',
    category: 'free',
    preview_image: '/templates/minimalist-light.png',
    features: [
      'Clean light theme with gradient background',
      'Excellent contrast for accessibility',
      'Elegant card-based layout',
      'Professional styling throughout',
      'Smooth hover animations',
      'Mobile responsive design'
    ],
    color_scheme: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      surface: '#ffffff',
      text_primary: '#1f2937',
      text_secondary: '#6b7280',
      border: '#e5e7eb'
    },
    layout: {
      header_style: 'centered',
      link_style: 'cards',
      spacing: 'spacious',
      avatar_size: 'large'
    },
    typography: {
      heading_font: 'Sharp Grotesk',
      body_font: 'Sharp Grotesk',
      heading_size: '32px',
      body_size: '16px'
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
  },

  'gta-vice-city': {
    id: 'gta-vice-city',
    name: 'Miami Nights',
    description: 'Experience the neon-soaked streets of Miami with vibrant sunset gradients and retro-futuristic styling.',
    category: 'free',
    preview_image: '/templates/gta-vice-city.png',
    features: [
      'Miami neon aesthetics',
      'Tropical sunset gradients',
      'Retro-futuristic design',
      'Ocean-inspired styling',
      'Animated neon effects'
    ],
    color_scheme: {
      primary: '#FF6EC7', // Hot pink/magenta
      secondary: '#FF1493', // Deep pink
      accent: '#00FFFF', // Cyan
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      surface: 'rgba(255, 110, 199, 0.15)',
      text_primary: '#FFFFFF',
      text_secondary: '#E0E0E0',
      border: '#FF6EC7'
    },
    layout: {
      header_style: 'centered',
      link_style: 'cards',
      spacing: 'normal',
      avatar_size: 'large'
    },
    typography: {
      heading_font: 'Orbitron',
      body_font: 'Rajdhani',
      heading_size: '36px',
      body_size: '18px'
    }
  },

  'cyberpunk-neon': {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Futuristic cyberpunk theme with vibrant neon colors and glitch effects. Perfect for tech enthusiasts.',
    category: 'free',
    preview_image: '/templates/cyberpunk-neon.png',
    features: [
      'Vibrant neon color scheme',
      'Glitch and scanline effects',
      'Futuristic typography',
      'Animated hover states',
      'Glassmorphic cards'
    ],
    color_scheme: {
      primary: '#00FFFF', // Cyan
      secondary: '#FF00FF', // Magenta
      accent: '#00FF00', // Electric green
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      surface: 'rgba(0, 0, 0, 0.3)',
      text_primary: '#FFFFFF',
      text_secondary: '#CCCCCC',
      border: '#00FFFF'
    },
    layout: {
      header_style: 'centered',
      link_style: 'cards',
      spacing: 'normal',
      avatar_size: 'large'
    },
    typography: {
      heading_font: 'Orbitron',
      body_font: 'Rajdhani',
      heading_size: '36px',
      body_size: '18px'
    }
  },

  'sunset-gradient': {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm and inviting theme with beautiful sunset gradients and soft shadows. Perfect for creatives.',
    category: 'free',
    preview_image: '/templates/sunset-gradient.png',
    features: [
      'Warm sunset color palette',
      'Smooth gradient transitions',
      'Soft shadow effects',
      'Elegant typography',
      'Responsive design'
    ],
    color_scheme: {
      primary: '#FF6F61', // Bright coral for links
      secondary: '#E55B50', // Darker coral for hover
      accent: '#FFB347', // Amber for accent elements
      background: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)', // Sunset gradient
      surface: '#FFF5EE', // Light cream for section backgrounds
      text_primary: '#2C2C2C', // Deep charcoal for headings
      text_secondary: '#444444', // Dark warm gray for paragraphs
      border: '#FF6F61' // Coral for borders
    },
    layout: {
      header_style: 'centered',
      link_style: 'cards',
      spacing: 'spacious',
      avatar_size: 'large'
    },
    typography: {
      heading_font: 'Poppins',
      body_font: 'Inter',
      heading_size: '32px',
      body_size: '16px'
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
  'github-focus': 'GitHubFocusTemplate',
  'gta-vice-city': 'GTAViceCityTemplate',
  'cyberpunk-neon': 'CyberpunkNeonTemplate',
  'sunset-gradient': 'SunsetGradientTemplate'
} as const

export type TemplateComponentName = typeof TEMPLATE_COMPONENTS[TemplateId]
