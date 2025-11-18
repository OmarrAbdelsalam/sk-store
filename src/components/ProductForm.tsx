
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductForm } from '@/hooks/useProductForm';
import ProductBasicInfo from '@/components/forms/ProductBasicInfo';
import ProductPhotos from '@/components/forms/ProductPhotos';
import ProductColors from '@/components/forms/ProductColors';
import ProductMaterials from '@/components/forms/ProductMaterials';
import ProductInventory from '@/components/forms/ProductInventory';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  categories: any[];
  colors: any[];
  sizes: any[];
  onSave: (product: any) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  product,
  categories,
  sizes,
  onSave
}) => {
  const {
    formData,
    setFormData,
    newMaterial,
    setNewMaterial,
    newTag,
    setNewTag,
    newColor,
    setNewColor,
    addMaterial,
    removeMaterial,
    addTag,
    removeTag,
    addPhoto,
    removePhoto,
    addColor,
    removeColor,
    toggleCategory,
    toggleSize,
    updateVariantStock,
    getVariantStock
  } = useProductForm(product);

  const handleSave = () => {
    const totalStock = formData.variants.reduce((sum, variant) => sum + variant.stock, 0);
    onSave({ ...formData, stock: totalStock });
    onOpenChange(false);
  };

  const t = {
    productDetails: 'تفاصيل المنتج',
    basicInfo: 'المعلومات الأساسية',
    photos: 'الصور',
    materials: 'المواد',
    inventory: 'المخزون',
    colors: 'الألوان',
    save: 'حفظ',
    cancel: 'إلغاء'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? t.productDetails : `${t.productDetails} - جديد`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">{t.basicInfo}</TabsTrigger>
            <TabsTrigger value="photos">{t.photos}</TabsTrigger>
            <TabsTrigger value="colors">{t.colors}</TabsTrigger>
            <TabsTrigger value="materials">{t.materials}</TabsTrigger>
            <TabsTrigger value="inventory">{t.inventory}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ProductBasicInfo
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              sizes={sizes}
              newTag={newTag}
              setNewTag={setNewTag}
              addTag={addTag}
              removeTag={removeTag}
              toggleCategory={toggleCategory}
              toggleSize={toggleSize}
            />
          </TabsContent>

          <TabsContent value="photos">
            <ProductPhotos
              formData={formData}
              addPhoto={addPhoto}
              removePhoto={removePhoto}
            />
          </TabsContent>

          <TabsContent value="colors">
            <ProductColors
              formData={formData}
              newColor={newColor}
              setNewColor={setNewColor}
              addColor={addColor}
              removeColor={removeColor}
            />
          </TabsContent>

          <TabsContent value="materials">
            <ProductMaterials
              formData={formData}
              newMaterial={newMaterial}
              setNewMaterial={setNewMaterial}
              addMaterial={addMaterial}
              removeMaterial={removeMaterial}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <ProductInventory
              formData={formData}
              sizes={sizes}
              getVariantStock={getVariantStock}
              updateVariantStock={updateVariantStock}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave}>
            {t.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
