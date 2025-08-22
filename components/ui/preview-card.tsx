import Image from 'next/image';
import rightImage from "../../assets/images/rightbox.svg";

interface PreviewCardProps {
  className?: string;
}

export function PreviewCard({ className = "" }: PreviewCardProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={rightImage}
        alt="Preview Card"
        width={444}
        height={536}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  );
}