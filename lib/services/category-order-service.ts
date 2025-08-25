import { supabase } from '@/lib/supabase'
import { LinkCategory } from '@/lib/domain/entities'
import { DEFAULT_CATEGORY_ORDER } from './link-constants'

/**
 * Service to handle category ordering functionality
 */
export class CategoryOrderService {
  
  /**
   * Default category order
   */
  static readonly DEFAULT_ORDER: LinkCategory[] = DEFAULT_CATEGORY_ORDER

  /**
   * Get the category order for a user
   * If the user doesn't have a custom order, returns the default order
   */
  static async getCategoryOrder(userId: string): Promise<LinkCategory[]> {
    try {
      // Get auth session
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      const response = await fetch(`/api/links/category-order?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
      })

      if (!response.ok) {
        console.warn(`Failed to fetch category order (${response.status}):`, await response.text())
        return this.DEFAULT_ORDER
      }

      const data = await response.json()
      return data.categoryOrder || this.DEFAULT_ORDER
    } catch (error) {
      console.error('Error fetching category order:', error)
      return this.DEFAULT_ORDER
    }
  }

  /**
   * Update the category order for a user
   */
  static async updateCategoryOrder(userId: string, order: LinkCategory[]): Promise<boolean> {
    try {
      // Get auth session
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      const response = await fetch('/api/links/category-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ order }),
      })

      if (!response.ok) {
        console.error(`Failed to update category order (${response.status}):`, await response.text())
        throw new Error('Failed to update category order')
      }

      return true
    } catch (error) {
      console.error('Error updating category order:', error)
      return false
    }
  }
  
  /**
   * Reset the category order to default
   */
  static async resetCategoryOrder(userId: string): Promise<boolean> {
    return this.updateCategoryOrder(userId, this.DEFAULT_ORDER)
  }
}