'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { checkBackgroundImagesBucket, checkUserUploadsBucket } from '@/lib/utils/storage-setup'

export default function CheckStorageSetup() {
  const [status, setStatus] = useState({
    backgroundImages: false,
    userUploads: false,
    checking: true,
    error: null as string | null
  })

  useEffect(() => {
    async function checkStorage() {
      try {
        // Check background-images bucket
        const bgImagesExists = await checkBackgroundImagesBucket()
        
        // Check user-uploads bucket
        const userUploadsExists = await checkUserUploadsBucket()
        
        setStatus({
          backgroundImages: bgImagesExists,
          userUploads: userUploadsExists,
          checking: false,
          error: null
        })
      } catch (error: any) {
        setStatus({
          backgroundImages: false,
          userUploads: false,
          checking: false,
          error: error.message || 'Unknown error checking storage'
        })
      }
    }
    
    checkStorage()
  }, [])

  return (
    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
      <h2 className="text-lg font-medium text-white mb-4">Storage Bucket Status</h2>
      
      {status.checking ? (
        <p className="text-[#7a7a83]">Checking storage buckets...</p>
      ) : status.error ? (
        <div className="text-red-400">
          <p>Error checking storage: {status.error}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${status.backgroundImages ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[#7a7a83]">background-images bucket: {status.backgroundImages ? 'Available' : 'Not available'}</span>
          </div>
          
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${status.userUploads ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[#7a7a83]">user-uploads bucket: {status.userUploads ? 'Available' : 'Not available'}</span>
          </div>
          
          {!status.userUploads && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                The user-uploads bucket is required for custom icon uploads. Please run the migration:
              </p>
              <pre className="mt-2 p-2 bg-[#1a1a1a] rounded text-xs overflow-auto">
                npx supabase migration up
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}