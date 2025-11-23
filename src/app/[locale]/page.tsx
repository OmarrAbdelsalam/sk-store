"use client"

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
      
      {/* Logo Background Section */}
      <section 
        className="w-full h-32 md:h-48 flex items-center justify-center relative"
        style={{
          backgroundColor: '#042d87',
          backgroundImage: `url('/yhouse-logo.png')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
        aria-label="House Scrub Brand"
      >
      </section>
      <ProductGrid />
    </div>
  );
};

export default Index;
