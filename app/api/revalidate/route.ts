import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Get the tag to revalidate from the query
    const tag = request.nextUrl.searchParams.get('tag')
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Missing tag parameter' },
        { status: 400 }
      )
    }
    
    // Revalidate the tag
    revalidateTag(tag)
    
    return NextResponse.json({
      revalidated: true,
      tag,
      date: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}