export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  category: LinkCategory
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface LinkWithPreview extends Link {
  preview_status: PreviewStatus
  metadata?: RichPreviewMetadata
}

export type LinkCategory = 
  | 'personal'
  | 'projects' 
  | 'blogs'
  | 'achievements'
  | 'contact'
  | 'custom'
  | 'social'

export type PreviewStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'not_supported'

export interface RichPreviewMetadata {
  type: 'github' | 'blog' | 'webpage'
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain?: string
  timestamp?: string
}
