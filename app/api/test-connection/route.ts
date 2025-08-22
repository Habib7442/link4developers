import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('Environment variables:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ 
        error: 'NEXT_PUBLIC_SUPABASE_URL not found' 
      }, { status: 500 })
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY not found' 
      }, { status: 500 })
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔍 Supabase client created, testing query...')

    // Test simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    console.log('🔍 Query result:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data
    })

  } catch (error) {
    console.error('🔍 Connection test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
