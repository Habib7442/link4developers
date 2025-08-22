// API endpoint for rich preview statistics
// Provides analytics and insights about preview performance

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { RichPreviewService } from '@/lib/services/rich-preview-service'
import { supabase } from '@/lib/supabase'

// GET /api/links/preview/stats - Get preview statistics for user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user-specific preview stats
    const { data: userLinks, error: linksError } = await supabase
      .from('user_links')
      .select('preview_status, metadata, preview_fetched_at, created_at')
      .eq('user_id', user.id)

    if (linksError) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      total: userLinks.length,
      success: 0,
      failed: 0,
      pending: 0,
      github: 0,
      webpage: 0,
      recentlyUpdated: 0,
      needsRefresh: 0
    }

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    userLinks.forEach((link) => {
      // Count by status
      switch (link.preview_status) {
        case 'success':
          stats.success++
          if (link.metadata?.type === 'github_repo') stats.github++
          if (link.metadata?.type === 'webpage') stats.webpage++
          break
        case 'failed':
          stats.failed++
          break
        case 'pending':
          stats.pending++
          break
      }

      // Count recently updated
      if (link.preview_fetched_at) {
        const fetchedAt = new Date(link.preview_fetched_at)
        if (fetchedAt > oneDayAgo) {
          stats.recentlyUpdated++
        }
      }

      // Count links that might need refresh (older than 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      if (!link.preview_fetched_at || new Date(link.preview_fetched_at) < sevenDaysAgo) {
        stats.needsRefresh++
      }
    })

    // Calculate percentages
    const percentages = {
      successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0,
      failureRate: stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0,
      githubRatio: stats.success > 0 ? Math.round((stats.github / stats.success) * 100) : 0,
      webpageRatio: stats.success > 0 ? Math.round((stats.webpage / stats.success) * 100) : 0
    }

    return NextResponse.json({
      stats,
      percentages,
      recommendations: generateRecommendations(stats, userLinks.length)
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
