'use client';

import { useState } from 'react';

interface AvatarImageProps {
  src: string;
  alt: string;
  fallback?: string;
}

export function AvatarImage({ src, alt, fallback }: AvatarImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

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