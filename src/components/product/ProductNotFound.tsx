import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const ProductNotFound = () => {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn&apos;t find the product you&apos;re looking for
          </p>
          <Button 
            onClick={() => router.push(`/${locale}`)}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductNotFound;
