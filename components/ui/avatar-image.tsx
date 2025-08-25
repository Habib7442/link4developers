'use client';

import { useState } from 'react';

interface AvatarImageProps {
  src: string;
  alt: string;
  fallback?: string;
}

export function AvatarImage({ src, alt, fallback }: AvatarImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  // Don't render if src is null, undefined, or empty string
  if (!src || src.trim() === '') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <span className="text-white font-bold text-sm">
          {alt ? alt[0].toUpperCase() : 'U'}
        </span>
      </div>
    );
  }

  const handleError = () => {
    if (fallback) {
      setImgSrc(fallback);
    } else {
      // Generate a default avatar with initials
      setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random`);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className="h-full w-full object-cover"
      onError={handleError}
    />
  );
}