import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicProfile } from '@/components/public/public-profile'
import { PublicProfileService } from '@/lib/services/public-profile-service'

// Set to 0 for on-demand revalidation only
export const revalidate = 0 
export const dynamic = 'force-dynamic' // Force dynamic rendering to get latest data
export const dynamicParams = true // Allow dynamic params not in generateStaticParams

interface PublicProfilePageProps {
  params: {
    username: string
  }
}

// Generate static params for popular profiles at build time
export async function generateStaticParams() {
  try {
    // Pre-generate the first 10 most popular profiles
    // In a real app, you might fetch this from analytics or a popular users table
    const popularUsernames = [
      'demo',
      'example',
      'test',
      'admin',
      'developer'
    ]

    return popularUsernames.map((username) => ({
      username: username
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params
    const { user } = await PublicProfileService.getPublicProfile(resolvedParams.username)

    if (!user) {
      return {
        title: 'Profile Not Found - Link4Coders',
        description: 'The requested developer profile could not be found.'
      }
    }

    const title = `${user.full_name || user.github_username || 'Developer'} - Link4Coders`
    const description = user.bio || `Check out ${user.full_name || user.github_username || 'this developer'}'s profile on Link4Coders`
    const profileUrl = `https://link4coders.in/${resolvedParams.username}`

    return {
      title,
      description,
      keywords: [
        'developer profile',
        'portfolio',
        'github',
        'coding',
        'programming',
        user.full_name,
        user.github_username,
        user.company,
        user.location
      ].filter(Boolean).join(', '),
      authors: [{ name: user.full_name || user.github_username || 'Developer' }],
      creator: user.full_name || user.github_username || 'Developer',
      publisher: 'Link4Coders',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title,
        description,
        url: profileUrl,
        siteName: 'Link4Coders',
        images: user.avatar_url ? [
          {
            url: user.avatar_url,
            width: 400,
            height: 400,
            alt: `${user.full_name || user.github_username || 'Developer'}'s avatar`
          }
        ] : [
          {
            url: 'https://link4coders.in/og-default.png',
            width: 1200,
            height: 630,
            alt: 'Link4Coders - Developer Profiles'
          }
        ],
        type: 'profile',
        locale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: user.avatar_url ? [user.avatar_url] : ['https://link4coders.in/og-default.png'],
        creator: user.twitter_username ? `@${user.twitter_username}` : '@link4coders',
        site: '@link4coders'
      },
      alternates: {
        canonical: profileUrl
      },
      other: {
        'profile:first_name': user.full_name?.split(' ')[0] || '',
        'profile:last_name': user.full_name?.split(' ').slice(1).join(' ') || '',
        'profile:username': user.github_username || user.profile_slug || ''
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Profile - Link4Coders',
      description: 'Developer profile on Link4Coders'
    }
  }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params

    // Validate username parameter
    if (!resolvedParams.username || resolvedParams.username.trim() === '') {
      notFound()
    }

    // Sanitize username (basic validation)
    const username = resolvedParams.username.toLowerCase().trim()
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      notFound()
    }

    const { user, links, appearanceSettings, categoryOrder } = await PublicProfileService.getPublicProfile(username)

    if (!user) {
      notFound()
    }

    // Add debugging log
    console.log(`🔍 Server: Profile loaded for ${username}. Theme ID: ${user.theme_id}`)

    return <PublicProfile user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} />
  } catch (error) {
    console.error('Error loading public profile:', error)
    notFound()
  }
}