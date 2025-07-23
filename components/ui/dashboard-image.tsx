'use client';

import { useState } from 'react';

export function DashboardImage() {
  const [imgSrc, setImgSrc] = useState('/dashboard-preview.svg');

  const handleError = () => {
    setImgSrc('https://placehold.co/1200x675/1a1a1a/ffffff?text=Link4Coders+Dashboard');
  };

  return (
    <img 
      src={imgSrc} 
      alt="Link4Coders Dashboard Preview" 
      className="w-full h-full object-cover"
      onError={handleError}
    />
  );
}