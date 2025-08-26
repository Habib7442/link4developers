import { Link, LinkWithPreview, LinkCategory } from '@/lib/domain/entities'

export interface LinkRepository {
  getUserLinks(userId: string): Promise<Record<LinkCategory, LinkWithPreview[]>>
  createLink(userId: string, linkData: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Link>
  updateLink(userId: string, linkId: string, updates: Partial<Link>): Promise<Link | null>
  deleteLink(userId: string, linkId: string): Promise<boolean>
  toggleLinkStatus(userId: string, linkId: string): Promise<Link | null>
  updateCategoryOrder(userId: string, categoryOrder: LinkCategory[]): Promise<boolean>
}

export interface LinkUseCases {
  getUserLinks(userId: string): Promise<Record<LinkCategory, LinkWithPreview[]>>
  createLink(userId: string, linkData: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Link>
  updateLink(userId: string, linkId: string, updates: Partial<Link>): Promise<Link | null>
  deleteLink(userId: string, linkId: string): Promise<boolean>
  toggleLinkStatus(userId: string, linkId: string): Promise<Link | null>
  updateCategoryOrder(userId: string, categoryOrder: LinkCategory[]): Promise<boolean>
}

export class LinkUseCaseImpl implements LinkUseCases {
  constructor(private linkRepository: LinkRepository) {}

  async getUserLinks(userId: string): Promise<Record<LinkCategory, LinkWithPreview[]>> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.linkRepository.getUserLinks(userId)
  }

  async createLink(userId: string, linkData: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Link> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.linkRepository.createLink(userId, linkData)
  }

  async updateLink(userId: string, linkId: string, updates: Partial<Link>): Promise<Link | null> {
    if (!userId || !linkId) {
      throw new Error('User ID and Link ID are required')
    }
    return this.linkRepository.updateLink(userId, linkId, updates)
  }

  async deleteLink(userId: string, linkId: string): Promise<boolean> {
    if (!userId || !linkId) {
      throw new Error('User ID and Link ID are required')
    }
    return this.linkRepository.deleteLink(userId, linkId)
  }

  async toggleLinkStatus(userId: string, linkId: string): Promise<Link | null> {
    if (!userId || !linkId) {
      throw new Error('User ID and Link ID are required')
    }
    return this.linkRepository.toggleLinkStatus(userId, linkId)
  }

  async updateCategoryOrder(userId: string, categoryOrder: LinkCategory[]): Promise<boolean> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    if (!categoryOrder || categoryOrder.length === 0) {
      throw new Error('Category order is required')
    }
    return this.linkRepository.updateCategoryOrder(userId, categoryOrder)
  }
}

