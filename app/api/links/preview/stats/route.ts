// API endpoint for rich preview statistics
// Provides analytics and insights about preview performance

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { RichPreviewService } from '@/lib/services/rich-preview-service'
import { supabase } from '@/lib/supabase'

// GET /api/links/preview/stats - Get preview statistics for user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    // Get preview statistics for the user
    const { data: stats, error: statsError } = await supabase
      .from('user_links')
      .select('preview_status, preview_fetched_at, preview_expires_at')
      .eq('user_id', user.id)
      .not('preview_status', 'is', null)

    if (statsError) {
      console.error('Error fetching preview stats:', statsError)
      return NextResponse.json({ error: 'Failed to fetch preview statistics' }, { status: 500 })
    }

    // Calculate statistics
    const total = stats.length
    const pending = stats.filter(s => s.preview_status === 'pending').length
    const completed = stats.filter(s => s.preview_status === 'completed').length
    const failed = stats.filter(s => s.preview_status === 'failed').length
    const expired = stats.filter(s => s.preview_expires_at && new Date(s.preview_expires_at) < new Date()).length

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        completed,
        failed,
        expired,
        successRate: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    })

  } catch (error) {
    console.error('Preview stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateRecommendations(stats: any, totalLinks: number): string[] {
  const recommendations: string[] = []

  if (stats.failed > 0) {
    recommendations.push(`You have ${stats.failed} failed preview${stats.failed > 1 ? 's' : ''}. Try refreshing them.`)
  }

  if (stats.pending > 0) {
    recommendations.push(`${stats.pending} preview${stats.pending > 1 ? 's are' : ' is'} still loading.`)
  }

  if (stats.needsRefresh > 0) {
    recommendations.push(`${stats.needsRefresh} preview${stats.needsRefresh > 1 ? 's' : ''} might be outdated and could benefit from a refresh.`)
  }

  if (stats.github > stats.webpage && stats.github > 0) {
    recommendations.push('You have more GitHub repositories than other links. Consider adding more diverse content.')
  }

  if (totalLinks < 5) {
    recommendations.push('Add more links to create a comprehensive profile.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Your link previews are looking great! All previews are up to date.')
  }

  return recommendations
}
