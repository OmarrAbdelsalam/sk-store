"use client"

import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen">
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
      >
      </section>
      <ProductGrid />
    </div>
  );
};

export default Index;
