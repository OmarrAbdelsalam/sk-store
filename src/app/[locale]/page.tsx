import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* SEO Content - Hidden visually but accessible for SEO */}
      <div className="sr-only">
        <h1>House Scrub - Premium Medical Scrubs and Healthcare Uniforms | ملابس طبية فاخرة</h1>
        <p>
          Shop high-quality medical scrubs, healthcare uniforms, and professional medical wear. 
          Free shipping across Egypt. تسوق ملابس طبية عالية الجودة مع شحن مجاني في مصر.
        </p>
        <nav aria-label="Quick Links">
          <ul>
            <li><a href="#products">Browse Products</a></li>
            <li><a href="/cart">Shopping Cart</a></li>
            <li><a href="/my-orders">Track Orders</a></li>
            <li><a href="https://wa.me/+201501881005" target="_blank" rel="noopener noreferrer">Contact Us on WhatsApp</a></li>
          </ul>
        </nav>
      </div>
      
      {/* Logo Background Section - Using Next Image for LCP optimization */}
      <section 
        className="w-full h-32 md:h-48 flex items-center justify-center relative bg-[#042d87]"
        aria-label="House Scrub Brand"
      >
        <Image
          src="/yhouse-logo.png"
          alt="House Scrub Logo"
          width={200}
          height={100}
          priority
          className="object-contain h-24 md:h-36 w-auto"
        />
      </section>
      <ProductGrid />
    </div>
  );
};

export default Index;
