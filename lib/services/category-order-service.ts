import { supabase } from '@/lib/supabase'
import { LinkCategory } from './link-service'

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
      const { data, error } = await supabase
        .from('users')
        .select('category_order')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching category order:', error)
        return this.DEFAULT_ORDER
      }

      // If no custom order is set, return default
      if (!data?.category_order || !Array.isArray(data.category_order)) {
        return this.DEFAULT_ORDER
      }

      // Validate that all required categories are present
      const customOrder = data.category_order as string[]
      const isValid = this.validateCategoryOrder(customOrder)
      
      if (!isValid) {
        console.warn('Invalid category order found, returning default')
        return this.DEFAULT_ORDER
      }

      return customOrder as LinkCategory[]
    } catch (error) {
      console.error('Error in getCategoryOrder:', error)
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

      const { error } = await supabase
        .from('users')
        .update({
          category_order: newOrder,
          updated_at: new Date().toISOString()
        })
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

  /**
   * Reset category order to default for a user
   */
  static async resetCategoryOrder(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          category_order: this.DEFAULT_ORDER,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error resetting category order:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in resetCategoryOrder:', error)
      return false
    }
  }

  /**
   * Validate that a category order contains all required categories
   */
  static validateCategoryOrder(order: string[]): boolean {
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
