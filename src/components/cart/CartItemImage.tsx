import Image from "next/image";

interface CartItemImageProps {
  src: string;
  alt: string;
}

export default function CartItemImage({ src, alt }: CartItemImageProps) {
  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-luxury-cream to-luxury-platinum 
      rounded-xl overflow-hidden flex-shrink-0 group/image shadow-sm">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 96px, 128px"
        className="object-cover transition-transform duration-500 group-hover/image:scale-110"
        loading="lazy"
        quality={80}
      />
      {/* تأثير hover على الصورة */}
      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300" />
    </div>
  );
}
