// Test endpoint for debugging GitHub API integration
import { NextRequest, NextResponse } from 'next/server'
import { GitHubApiService } from '@/lib/services/github-api-service'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    console.log('🔍 Test GitHub API: Testing URL:', url)
    
    // Test the GitHub API service directly
    const metadata = await GitHubApiService.fetchRepoMetadata(url)
    
    console.log('✅ Test GitHub API: Success:', metadata)
    
    return NextResponse.json({
      success: true,
      metadata,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test GitHub API: Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
