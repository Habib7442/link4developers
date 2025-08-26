export interface UserAppearanceSettings {
  id: string
  user_id: string
  theme_id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  font_size_base: number
  font_size_heading: number
  font_size_subheading: number
  line_height_base: number
  line_height_heading: number
  card_border_radius: number
  card_border_width: number
  card_backdrop_blur: number
  card_shadow: string
  button_style: string
  button_border_radius: number
  button_padding_x: number
  button_padding_y: number
  element_spacing: number
  container_max_width: number
  social_icon_background: string
  social_icon_hover_color: string
  created_at: string
  updated_at: string
}

export interface AppearanceUpdateData {
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  font_family?: string
  font_size_base?: number
  font_size_heading?: number
  font_size_subheading?: number
  line_height_base?: number
  line_height_heading?: number
  card_border_radius?: number
  card_border_width?: number
  card_backdrop_blur?: number
  card_shadow?: string
  button_style?: string
  button_border_radius?: number
  button_padding_x?: number
  button_padding_y?: number
  element_spacing?: number
  container_max_width?: number
  social_icon_background?: string
  social_icon_hover_color?: string
}

