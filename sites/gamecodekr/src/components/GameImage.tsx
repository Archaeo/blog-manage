"use client";

interface GameImageProps {
  src: string;
  alt: string;
  fallbackIcon: string;
  className?: string;
  iconClassName?: string;
}

export function GameImage({
  src,
  alt,
  fallbackIcon,
  className = "h-12 w-12 rounded-lg object-cover",
  iconClassName = "text-4xl",
}: GameImageProps) {
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        }}
      />
      <span className={`hidden ${iconClassName}`}>{fallbackIcon}</span>
    </>
  );
}
