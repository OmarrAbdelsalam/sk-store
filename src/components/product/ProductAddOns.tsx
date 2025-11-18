import {  useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import Image from "next/image";

interface ProductAddOnsProps {
  embroideryOneSide: boolean;
  embroideryTwoSides: boolean;
  embroideryName: string;
  addLogo: boolean;
  logoFile: File | null;
  logoPreview: string | null;
  notes: string;
  addOnsOpen: boolean;
  onEmbroideryOneSideChange: (value: boolean) => void;
  onEmbroideryTwoSidesChange: (value: boolean) => void;
  onEmbroideryNameChange: (value: string) => void;
  onAddLogoChange: (value: boolean) => void;
  onLogoFileChange: (file: File | null) => void;
  onLogoPreviewChange: (preview: string | null) => void;
  onNotesChange: (value: string) => void;
  onAddOnsOpenChange: (open: boolean) => void;
}

const ProductAddOns = ({
  embroideryOneSide,
  embroideryTwoSides,
  embroideryName,
  logoFile,
  logoPreview,
  notes,
  addOnsOpen,
  onEmbroideryOneSideChange,
  onEmbroideryTwoSidesChange,
  onEmbroideryNameChange,
  onLogoFileChange,
  onLogoPreviewChange,
  onNotesChange,
  onAddOnsOpenChange
}: ProductAddOnsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLogoFileChange(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        onLogoPreviewChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Collapsible open={addOnsOpen} onOpenChange={onAddOnsOpenChange}>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  اختياري
                </Badge>
                <CardTitle className="text-xl">
                  إضافات
                </CardTitle>
              </div>
              {addOnsOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              اختر إضافة واحدة
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Embroidery One Side */}
              <Card className={`cursor-pointer transition-all duration-200 ${
                embroideryOneSide 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
              onClick={() => {
                onEmbroideryOneSideChange(!embroideryOneSide);
                if (!embroideryOneSide) onEmbroideryTwoSidesChange(false);
              }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        embroideryOneSide 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {embroideryOneSide && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <Label className="font-medium cursor-pointer">
                          تطريز (وجه واحد)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          تطريز على وجه واحد
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-semibold">25 جنيه</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Embroidery Two Sides */}
              <Card className={`cursor-pointer transition-all duration-200 ${
                embroideryTwoSides 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
              onClick={() => {
                onEmbroideryTwoSidesChange(!embroideryTwoSides);
                if (!embroideryTwoSides) onEmbroideryOneSideChange(false);
              }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        embroideryTwoSides 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {embroideryTwoSides && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <Label className="font-medium cursor-pointer">
                          تطريز (وجهين)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          تطريز على الوجهين
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-semibold">45 جنيه</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {(embroideryOneSide || embroideryTwoSides) && (
              <div className="space-y-6 pt-6 border-t border-primary/20">
                {/* Enter Name Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl"></div>
                  <Card className="relative bg-background/80 backdrop-blur-sm border-primary/30 shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          </div>
                          <div>
                            <Label htmlFor="embroidery-name" className="text-base font-semibold">
                              إضافة الاسم
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              أدخل الاسم المراد تطريزه
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <Input
                            id="embroidery-name"
                            value={embroideryName}
                            onChange={(e) => onEmbroideryNameChange(e.target.value)}
                            placeholder="د. أحمد محمد"
                            className="text-lg py-3 border-primary/30 focus:border-primary bg-background/50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Logo Upload Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent rounded-xl"></div>
                  <Card className="relative bg-background/80 backdrop-blur-sm border-secondary/30 shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-secondary" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">
                              إضافة الشعار
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              إضافة شعار المستشفى أو العيادة
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-secondary/50 hover:bg-secondary/10"
                          >
                            <Upload className="w-4 h-4 ml-2" />
                            اختر ملف
                          </Button>
                          {logoFile && (
                            <span className="text-sm text-muted-foreground">
                              {logoFile.name}
                            </span>
                          )}
                        </div>
                        
                        {logoPreview && (
                          <div className="mt-4">
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-16 w-auto border rounded-lg bg-white p-2"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Special Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-semibold">
                ملاحظات خاصة
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="أي ملاحظات خاصة أو تفاصيل إضافية..."
                className="min-h-[100px] resize-none border-muted-foreground/30 focus:border-primary"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ProductAddOns;