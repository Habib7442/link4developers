import Image from 'next/image';

interface PreviewCardProps {
  className?: string;
}

export function PreviewCard({ className = "" }: PreviewCardProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/rightbox.svg"
        alt="Preview Card"
        width={444}
        height={536}
        className="w-full h-full object-contain"
        priority
        onError={(e) => {
          console.error('Failed to load preview card image:', e);
        }}
      />
    </div>
  );
}