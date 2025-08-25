import { supabase } from '@/lib/supabase'
import { LinkCategory } from './link-service'
import { getAuthHeaders } from '@/lib/utils/auth-headers'

/**
 * Service for managing category section order in the Link Manager
 */
export class CategoryOrderService {
  
  /**
   * Default category order
   */
  static readonly DEFAULT_ORDER: LinkCategory[] = [
    'personal',
    'projects', 
    'blogs',
    'achievements',
    'contact',
    'social',
    'custom'
  ]

  /**
   * Get the category order for a user
   */
  static async getCategoryOrder(userId: string): Promise<LinkCategory[]> {
    try {
      console.log('🔄 Fetching category order from API...')
      
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/links/category-order', {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error fetching category order:', errorData)
        return this.DEFAULT_ORDER
      }

      const result = await response.json()
      const categoryOrder = result.data

      if (!categoryOrder || !Array.isArray(categoryOrder)) {
        console.warn('⚠️ No valid category order from API, using default')
        return this.DEFAULT_ORDER
      }

      // Validate that all required categories are present
      const isValid = this.validateCategoryOrder(categoryOrder)
      
      if (!isValid) {
        console.warn('⚠️ Invalid category order from API, using default')
        return this.DEFAULT_ORDER
      }

      console.log('✅ Category order fetched successfully:', categoryOrder)
      return categoryOrder as LinkCategory[]
    } catch (error) {
      console.error('❌ Error in getCategoryOrder:', error)
      return this.DEFAULT_ORDER
    }
  }

  /**
   * Update the category order for a user
   */
  static async updateCategoryOrder(userId: string, newOrder: LinkCategory[]): Promise<boolean> {
    try {
      // Validate the new order
      if (!this.validateCategoryOrder(newOrder)) {
        throw new Error('Invalid category order provided')
      }

      console.log('🔄 Updating category order via API...')
      
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/links/category-order', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ categoryOrder: newOrder }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error updating category order:', errorData)
        return false
      }

      const result = await response.json()
      console.log('✅ Category order updated successfully via API')
      return result.data?.success || false
    } catch (error) {
      console.error('❌ Error in updateCategoryOrder:', error)
      return false
    }
  }

  /**
   * Reset category order to default for a user
   */
  static async resetCategoryOrder(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Resetting category order via API...')
      
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/links/category-order', {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error resetting category order:', errorData)
        return false
      }

      const result = await response.json()
      console.log('✅ Category order reset successfully via API')
      return result.data?.success || false
    } catch (error) {
      console.error('❌ Error in resetCategoryOrder:', error)
      return false
    }
  }

  /**
   * Validate that a category order contains all required categories
   */
  static validateCategoryOrder(order: LinkCategory[]): boolean {
    if (!Array.isArray(order) || order.length !== this.DEFAULT_ORDER.length) {
      return false
    }

    // Check that all default categories are present
    const orderSet = new Set(order)
    const defaultSet = new Set(this.DEFAULT_ORDER)
    
    if (orderSet.size !== defaultSet.size) {
      return false
    }

    for (const category of this.DEFAULT_ORDER) {
      if (!orderSet.has(category)) {
        return false
      }
    }

    return true
  }

  /**
   * Reorder an array of categories based on user's custom order
   */
  static applyCategoryOrder<T extends { category?: LinkCategory }>(
    items: T[], 
    categoryOrder: LinkCategory[]
  ): T[] {
    const orderMap = new Map(categoryOrder.map((cat, index) => [cat, index]))
    
    return items.sort((a, b) => {
      const orderA = a.category ? (orderMap.get(a.category) ?? 999) : 999
      const orderB = b.category ? (orderMap.get(b.category) ?? 999) : 999
      return orderA - orderB
    })
  }

  /**
   * Group and order categories based on user's custom order
   */
  static groupAndOrderCategories<T extends { category: LinkCategory }>(
    items: T[],
    categoryOrder: LinkCategory[]
  ): Record<LinkCategory, T[]> {
    // Group items by category
    const grouped: Record<LinkCategory, T[]> = {} as Record<LinkCategory, T[]>
    
    // Initialize all categories
    categoryOrder.forEach(category => {
      grouped[category] = []
    })
    
    // Group items
    items.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].push(item)
      }
    })
    
    return grouped
  }

  /**
   * Get ordered category entries for iteration
   */
  static getOrderedCategoryEntries<T>(
    groupedData: Record<LinkCategory, T[]>,
    categoryOrder: LinkCategory[]
  ): Array<[LinkCategory, T[]]> {
    return categoryOrder.map(category => [category, groupedData[category] || []])
  }
}
