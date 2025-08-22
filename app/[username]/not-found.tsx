import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, UserPlus } from 'lucide-react'

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[#18181a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
            <Search className="w-12 h-12 text-[#18181a]" />
          </div>
          <h1 className="text-[48px] font-bold leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] mb-8">
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-4">
            Profile Not Found
          </h2>
          <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk mb-6">
            The developer profile you're looking for doesn't exist or has been made private.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
            
            <Link href="/auth?mode=signup" className="block">
              <Button variant="outline" className="w-full border-[#33373b] text-white hover:bg-[#28282b]">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Your Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk">
          Looking for someone specific? Make sure you have the correct username or profile URL.
        </p>
        
      </div>
    </div>
  )
}
