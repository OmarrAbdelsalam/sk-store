// hooks/useProductForm.ts
"use client";

import { useState } from "react";

type LangText = { en: string; ar: string };

type ColorChoice = {
  id: number;
  name: LangText;
  hex: string; // "#RRGGBB"
};

type VariantRow = {
  colorId: number;
  sizeId: number;
  stock: number;
};

type ProductFormShape = {
  id: number;
  name: LangText;
  description: LangText;
  categories: number[];       // ids أو GUIDs حسب تصميمك
  gender: "unisex" | "men" | "women";
  price: number;
  materials: string[];
  photos: string[];
  availableColors: ColorChoice[];
  availableSizes: number[];   // ids للمقاسات
  isSizeFlexible: boolean;
  variants: VariantRow[];     // المصفوفة الأساسية لربط اللون بالمقاس بالمخزون
  tags: string[];
};

export const useProductForm = (product?: Partial<ProductFormShape>) => {
  const [formData, setFormData] = useState<ProductFormShape>(() => ({
    id: product?.id ?? Date.now(),
    name: product?.name ?? { en: "", ar: "" },
    description: product?.description ?? { en: "", ar: "" },
    categories: product?.categories ?? [],
    gender: (product?.gender as ProductFormShape["gender"]) ?? "unisex",
    price: product?.price ?? 0,
    materials: product?.materials ?? [],
    photos: product?.photos ?? [],
    availableColors: product?.availableColors ?? [],
    availableSizes: product?.availableSizes ?? [],
    isSizeFlexible: product?.isSizeFlexible ?? false,
    variants: product?.variants ?? [],
    tags: product?.tags ?? [],
  }));

  const [newMaterial, setNewMaterial] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState<ColorChoice>({
    id: 0,
    name: { en: "", ar: "" },
    hex: "#000000",
  });

  // ---- Materials ----
  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData(prev => ({ ...prev, materials: [...prev.materials, newMaterial.trim()] }));
      setNewMaterial("");
    }
  };
  const removeMaterial = (index: number) => {
    setFormData(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== index) }));
  };

  // ---- Tags ----
  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };
  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  // ---- Photos ----
  const addPhoto = () => {
    const photoUrl = prompt("Enter photo URL:");
    if (photoUrl) {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, photoUrl] }));
    }
  };
  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  // ---- Colors ----
  const addColor = () => {
    if (newColor.name.en.trim() && newColor.name.ar.trim()) {
      const id = Date.now();
      setFormData(prev => ({
        ...prev,
        availableColors: [...prev.availableColors, { ...newColor, id }],
      }));
      setNewColor({ id: 0, name: { en: "", ar: "" }, hex: "#000000" });
    }
  };
  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.filter((_, i) => i !== index),
      // امسح أي variants تخص اللون المتشال
      variants: prev.variants.filter(v => v.colorId !== prev.availableColors[index].id),
    }));
  };

  // ---- Categories toggle ----
  const toggleCategory = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  // ---- Sizes toggle ----
  const toggleSize = (sizeId: number) => {
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(sizeId)
        ? prev.availableSizes.filter(id => id !== sizeId)
        : [...prev.availableSizes, sizeId],
      // مبدئيًا لا نمسح variants تلقائيًا — سيبها لواجهة الإدارة تتصرف
    }));
  };

  // ---- Variants (IDs أرقام) ----
  const updateVariantStock = (colorId: number, sizeId: number, stock: number) => {
    setFormData(prev => {
      const variants = [...prev.variants];
      const idx = variants.findIndex(v => v.colorId === colorId && v.sizeId === sizeId);

      if (idx >= 0) {
        variants[idx] = { ...variants[idx], stock: Math.max(0, Number(stock) || 0) };
      } else {
        variants.push({ colorId, sizeId, stock: Math.max(0, Number(stock) || 0) });
      }
      return { ...prev, variants };
    });
  };

  const getVariantStock = (colorId: number, sizeId: number) => {
    const variant = formData.variants.find(v => v.colorId === colorId && v.sizeId === sizeId);
    return variant?.stock || 0;
  };

  return {
    formData,
    setFormData,
    // materials
    newMaterial, setNewMaterial, addMaterial, removeMaterial,
    // tags
    newTag, setNewTag, addTag, removeTag,
    // photos
    addPhoto, removePhoto,
    // colors
    newColor, setNewColor, addColor, removeColor,
    // toggles
    toggleCategory, toggleSize,
    // variants
    updateVariantStock, getVariantStock,
  };
};
