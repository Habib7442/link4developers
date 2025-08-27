import { LinkUseCaseImpl } from '@/lib/application/use-cases'
import { SupabaseLinkRepository } from '@/lib/infrastructure/repositories'
import { Link, LinkWithPreview, LinkCategory } from '@/lib/domain/entities'
import { supabase } from '@/lib/supabase'

// Create singleton instances
const linkRepository = new SupabaseLinkRepository()
const linkUseCases = new LinkUseCaseImpl(linkRepository)

// Export types for backward compatibility
export type { Link, LinkWithPreview, LinkCategory } from '@/lib/domain/entities'

// Export interfaces for backward compatibility
export interface UserLink extends Link {
  // Additional fields for rich link preview and UI
  icon_type: string
  custom_icon_url?: string
  uploaded_icon_url?: string
  icon_variant?: string
  use_custom_icon?: boolean
  icon_selection_type?: 'default' | 'platform' | 'upload' | 'url'
  platform_detected?: string
  live_project_url?: string
  description?: string
  click_count?: number
}
export interface CreateLinkData {
  title: string
  url: string
  description?: string
  icon_type: string
  category: LinkCategory
  metadata?: Record<string, unknown>
  display_order?: number
  is_active?: boolean
  custom_icon_url?: string
  uploaded_icon_url?: string
  icon_variant?: string
  use_custom_icon?: boolean
  icon_selection_type?: 'default' | 'platform' | 'upload' | 'url'
  platform_detected?: string
  live_project_url?: string
}

export interface UpdateLinkData extends Partial<CreateLinkData> {
  id: string
}

export class LinkService {
  static async getUserLinks(userId: string): Promise<Record<LinkCategory, LinkWithPreview[]>> {
    return linkUseCases.getUserLinks(userId)
  }

  static async createLink(userId: string, linkData: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Link> {
    return linkUseCases.createLink(userId, linkData)
  }

  static async updateLink(userId: string, linkId: string, updates: Partial<Link>): Promise<Link | null> {
    return linkUseCases.updateLink(userId, linkId, updates)
  }

  static async deleteLink(userId: string, linkId: string): Promise<boolean> {
    return linkUseCases.deleteLink(userId, linkId)
  }

  static async toggleLinkStatus(userId: string, linkId: string): Promise<Link | null> {
    return linkUseCases.toggleLinkStatus(userId, linkId)
  }

  static async updateCategoryOrder(userId: string, categoryOrder: LinkCategory[]): Promise<boolean> {
    return linkUseCases.updateCategoryOrder(userId, categoryOrder)
  }

  static async getLinkAnalytics(userId: string): Promise<{
    totalClicks: number;
    linksByCategory: Record<LinkCategory, number>;
    topLinks: Array<{ title: string; clicks: number; url: string }>;
  }> {
    try {
      // Import the AnalyticsService
      const { AnalyticsService } = await import('@/lib/database');
      
      // Get the actual analytics data
      const analyticsData = await AnalyticsService.getLinkAnalytics(userId);
      
      // Transform the data to match the expected format
      const linksByCategory: Record<LinkCategory, number> = {
        personal: 0,
        projects: 0,
        blogs: 0,
        achievements: 0,
        contact: 0,
        custom: 0,
        social: 0
      };
      
      // We'll need to fetch links with categories to calculate category-specific clicks
      const { data: links } = await supabase
        .from('user_links')
        .select('category, click_count')
        .eq('user_id', userId);
      
      // Calculate clicks by category
      if (links) {
        links.forEach(link => {
          if (link.category && link.category in linksByCategory) {
            linksByCategory[link.category as LinkCategory] += link.click_count || 0;
          }
        });
      }
      
      return {
        totalClicks: analyticsData.totalClicks,
        linksByCategory,
        topLinks: analyticsData.topLinks
      };
    } catch (error) {
      console.error('Error fetching link analytics:', error);
      return {
        totalClicks: 0,
        linksByCategory: {
          personal: 0,
          projects: 0,
          blogs: 0,
          achievements: 0,
          contact: 0,
          custom: 0,
          social: 0
        },
        topLinks: []
      };
    }
  }
  
  static async reorderLinks(userId: string, category: LinkCategory, linkIds: string[]): Promise<boolean> {
    try {
      const response = await fetch('/api/links/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, linkIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder links');
      }

      const result = await response.json();
      return result.data?.success || false;
    } catch (error) {
      console.error('Error reordering links:', error);
      return false;
    }
  }

  // Constants for link categories
  static readonly LINK_CATEGORIES = {
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

  // Popular platform configurations
  static readonly PLATFORM_CONFIGS = {
    github: { icon: 'Github', category: 'projects', baseUrl: 'https://github.com/' },
    linkedin: { icon: 'Linkedin', category: 'social', baseUrl: 'https://linkedin.com/in/' },
    twitter: { icon: 'Twitter', category: 'social', baseUrl: 'https://twitter.com/' },
    'dev-to': { icon: 'BookOpen', category: 'blogs', baseUrl: 'https://dev.to/' },
    medium: { icon: 'BookOpen', category: 'blogs', baseUrl: 'https://medium.com/@' },
    hashnode: { icon: 'BookOpen', category: 'blogs', baseUrl: 'https://hashnode.com/@' },
    stackoverflow: { icon: 'MessageSquare', category: 'achievements', baseUrl: 'https://stackoverflow.com/users/' },
    leetcode: { icon: 'Code', category: 'achievements', baseUrl: 'https://leetcode.com/' },
    portfolio: { icon: 'Globe', category: 'projects', baseUrl: '' },
    email: { icon: 'Mail', category: 'contact', baseUrl: 'mailto:' },
    website: { icon: 'Globe', category: 'contact', baseUrl: '' }
  } as const
}
