import Image from "next/image";

interface CartItemImageProps {
  src: string;
  alt: string;
}

export default function CartItemImage({ src, alt }: CartItemImageProps) {
  return (
    <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-[#f5f5f5] overflow-hidden flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 80px, 96px"
        className="object-cover"
        loading="lazy"
        quality={80}
      />
    </div>
  );
}
