import { Link, LinkWithPreview, LinkCategory } from '@/lib/domain/entities'
import { LinkRepository } from '@/lib/application/use-cases'
import { supabase } from '@/lib/supabase'

export class SupabaseLinkRepository implements LinkRepository {
  async getUserLinks(userId: string): Promise<Record<LinkCategory, LinkWithPreview[]>> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .select(`
          *,
          metadata
        `)
        .eq('user_id', userId)
        .order('position', { ascending: true })

      if (error) {
        console.error('Error fetching user links:', error)
        return this.getEmptyLinksObject()
      }

      const links = data || []
      return this.groupLinksByCategory(links as LinkWithPreview[])
    } catch (error) {
      console.error('Error in getUserLinks:', error)
      return this.getEmptyLinksObject()
    }
  }

  async createLink(userId: string, linkData: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Link> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .insert({
          ...linkData,
          user_id: userId
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create link: ${error.message}`)
      }

      return data as Link
    } catch (error) {
      console.error('Error in createLink:', error)
      throw error
    }
  }

  async updateLink(userId: string, linkId: string, updates: Partial<Link>): Promise<Link | null> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .update(updates)
        .eq('id', linkId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating link:', error)
        return null
      }

      return data as Link
    } catch (error) {
      console.error('Error in updateLink:', error)
      return null
    }
  }

  async deleteLink(userId: string, linkId: string): Promise<boolean> {
    try {
      // First check if the link exists
      const { data: linkExists, error: checkError } = await supabase
        .from('user_links')
        .select('id')
        .eq('id', linkId)
        .eq('user_id', userId)
        .single();
      
      if (checkError) {
        console.error('Error checking link existence:', checkError);
        return false;
      }
      
      if (!linkExists) {
        console.error('Link does not exist or already deleted');
        return true; // Already deleted, so consider it success
      }

      // Delete the link
      const { error } = await supabase
        .from('user_links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting link:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteLink:', error);
      return false;
    }
  }

  async toggleLinkStatus(userId: string, linkId: string): Promise<Link | null> {
    try {
      // First get the current status
      const { data: currentLink, error: fetchError } = await supabase
        .from('user_links')
        .select('is_active')
        .eq('id', linkId)
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        console.error('Error fetching link status:', fetchError)
        return null
      }

      const newStatus = !currentLink.is_active

      const { data, error } = await supabase
        .from('user_links')
        .update({ is_active: newStatus })
        .eq('id', linkId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error toggling link status:', error)
        return null
      }

      return data as Link
    } catch (error) {
      console.error('Error in toggleLinkStatus:', error)
      return null
    }
  }

  async updateCategoryOrder(userId: string, categoryOrder: LinkCategory[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ category_order: categoryOrder })
        .eq('id', userId)

      if (error) {
        console.error('Error updating category order:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateCategoryOrder:', error)
      return false
    }
  }

  private groupLinksByCategory(links: LinkWithPreview[]): Record<LinkCategory, LinkWithPreview[]> {
    const grouped = this.getEmptyLinksObject()
    
    links.forEach(link => {
      const category = link.category as LinkCategory
      if (grouped[category]) {
        grouped[category].push(link)
      }
    })

    return grouped
  }

  private getEmptyLinksObject(): Record<LinkCategory, LinkWithPreview[]> {
    return {
      personal: [],
      projects: [],
      blogs: [],
      achievements: [],
      contact: [],
      custom: [],
      social: []
    }
  }
}
