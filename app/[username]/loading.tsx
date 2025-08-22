export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#18181a]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Profile Header Skeleton */}
        <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] mb-8 text-center">
          
          {/* Avatar Skeleton */}
          <div className="mb-6">
            <div className="w-[120px] h-[120px] rounded-full mx-auto bg-[#28282b] animate-pulse" />
          </div>

          {/* Name and Title Skeleton */}
          <div className="mb-2">
            <div className="h-8 bg-[#28282b] rounded-lg mx-auto max-w-xs animate-pulse" />
          </div>
          
          <div className="mb-4">
            <div className="h-6 bg-[#28282b] rounded-lg mx-auto max-w-sm animate-pulse" />
          </div>

          {/* Bio Skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-4 bg-[#28282b] rounded mx-auto max-w-md animate-pulse" />
            <div className="h-4 bg-[#28282b] rounded mx-auto max-w-lg animate-pulse" />
          </div>

          {/* Meta Information Skeleton */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="h-4 bg-[#28282b] rounded w-20 animate-pulse" />
            <div className="h-4 bg-[#28282b] rounded w-24 animate-pulse" />
            <div className="h-4 bg-[#28282b] rounded w-28 animate-pulse" />
          </div>

          {/* Share Button Skeleton */}
          <div className="h-10 bg-[#28282b] rounded-lg mx-auto max-w-xs animate-pulse" />
        </div>

        {/* Links Section Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
              
              {/* Category Header Skeleton */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 bg-[#28282b] rounded animate-pulse" />
                <div className="h-6 bg-[#28282b] rounded w-32 animate-pulse" />
              </div>

              {/* Links Skeleton */}
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="bg-[#28282b] rounded-[12px] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#33373b] rounded animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-[#33373b] rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-[#33373b] rounded w-1/2 animate-pulse" />
                      </div>
                      <div className="w-4 h-4 bg-[#33373b] rounded animate-pulse flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="mt-8 text-center">
          <div className="h-4 bg-[#28282b] rounded mx-auto max-w-xs animate-pulse" />
        </div>
        
      </div>
    </div>
  )
}
