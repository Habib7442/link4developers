'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Github,
  Globe,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { useAuthStore } from '@/lib/store/auth-store'
import { toast } from 'sonner'

interface PreviewStats {
  total: number
  success: number
  failed: number
  pending: number
  github: number
  webpage: number
  recentlyUpdated: number
  needsRefresh: number
}

interface PreviewStatsResponse {
  stats: PreviewStats
  percentages: {
    successRate: number
    failureRate: number
    githubRatio: number
    webpageRatio: number
  }
  recommendations: string[]
}

export function PreviewManagement() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<PreviewStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [batchRefreshing, setBatchRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await ApiLinkService.getPreviewStats(user.id)
      setStats(response)
    } catch (error) {
      console.error('Failed to load preview stats:', error)
      toast.error('Failed to load preview statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshAll = async () => {
    if (!user || !stats) return

    try {
      setBatchRefreshing(true)
      toast.info('Starting batch refresh of all previews...')

      // Get all user links first
      const links = await ApiLinkService.getUserLinks(user.id)
      const allLinks = Object.values(links).flat()
      const linkIds = allLinks.map(link => link.id)

      if (linkIds.length === 0) {
        toast.info('No links found to refresh')
        return
      }

      // Batch refresh in chunks
      const chunkSize = 10
      for (let i = 0; i < linkIds.length; i += chunkSize) {
        const chunk = linkIds.slice(i, i + chunkSize)
        await ApiLinkService.batchRefreshPreviews(user.id, chunk)
        
        // Show progress
        const progress = Math.min(100, Math.round(((i + chunkSize) / linkIds.length) * 100))
        toast.info(`Refreshing previews... ${progress}%`)
      }

      toast.success('All previews refreshed successfully!')
      await loadStats() // Reload stats

    } catch (error) {
      console.error('Failed to refresh all previews:', error)
      toast.error('Failed to refresh previews')
    } finally {
      setBatchRefreshing(false)
    }
  }

  const handleRefreshFailed = async () => {
    if (!user || !stats) return

    try {
      setRefreshing(true)
      toast.info('Refreshing failed previews...')

      // This would need a specific API endpoint to get failed links
      // For now, we'll refresh all and let the system handle it
      await handleRefreshAll()

    } catch (error) {
      console.error('Failed to refresh failed previews:', error)
      toast.error('Failed to refresh failed previews')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-[#54E0FF] animate-spin" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Stats</h3>
          <p className="text-gray-400 mb-4">Unable to load preview statistics</p>
          <Button onClick={loadStats} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-[#54E0FF]" />
            <h2 className="text-xl font-semibold text-white font-['Sharp_Grotesk']">
              Preview Management
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshFailed}
              disabled={refreshing || batchRefreshing}
              variant="outline"
              size="sm"
              className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Failed
            </Button>
            <Button
              onClick={handleRefreshAll}
              disabled={refreshing || batchRefreshing}
              variant="outline"
              size="sm"
            >
              {batchRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh All
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.stats.total}</div>
            <div className="text-sm text-gray-400">Total Links</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.stats.success}</div>
            <div className="text-sm text-gray-400">Successful</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.stats.failed}</div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Success Rate</span>
            <span className="text-sm font-semibold text-white">{stats.percentages.successRate}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentages.successRate}%` }}
            />
          </div>
        </div>

        {/* Preview Types */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Github className="w-4 h-4 text-[#54E0FF]" />
              <span className="text-sm font-medium text-white">GitHub Repos</span>
            </div>
            <div className="text-xl font-bold text-white">{stats.stats.github}</div>
            <div className="text-xs text-gray-400">{stats.percentages.githubRatio}% of successful</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-[#54E0FF]" />
              <span className="text-sm font-medium text-white">Webpages</span>
            </div>
            <div className="text-xl font-bold text-white">{stats.stats.webpage}</div>
            <div className="text-xs text-gray-400">{stats.percentages.webpageRatio}% of successful</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {stats.recommendations.length > 0 && (
        <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <h3 className="text-lg font-semibold text-white mb-4 font-['Sharp_Grotesk']">
            Recommendations
          </h3>
          <div className="space-y-3">
            {stats.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
