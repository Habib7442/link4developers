import { supabase } from '@/lib/supabase'

/**
 * Get authorization headers for authenticated API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  return headers
}

/**
 * Get authorization headers with additional custom headers
 */
export async function getAuthHeadersWithCustom(customHeaders: Record<string, string>): Promise<Record<string, string>> {
  const baseHeaders = await getAuthHeaders()
  return { ...baseHeaders, ...customHeaders }
}
