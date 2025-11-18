import Image from "next/image";

interface CartItemImageProps {
  src: string;
  alt: string;
}

export default function CartItemImage({ src, alt }: CartItemImageProps) {
  return (
    <div className="relative w-24 h-24 bg-luxury-cream rounded-lg overflow-hidden flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="96px"
        className="object-cover"
        loading="lazy"
        quality={75}
      />
    </div>
  );
}
