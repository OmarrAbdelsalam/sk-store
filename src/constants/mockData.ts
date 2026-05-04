// Mock Data for Frontend-Only Store
// This replaces all backend API calls with static data

export interface MockProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  images: string[];
  mainImage: string;
  colors: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    hex: string;
  }>;
  variants: Array<{
    id: string;
    colorId?: string;
    sizeId?: string;
    quantity: number;
    sku?: string;
  }>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface MockCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface MockColor {
  id: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  displayOrder: number;
}

// Mock Categories
export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: "1",
    nameAr: "حقائب يد",
    nameEn: "Handbags",
    imageUrl: "https://dl.dropboxusercontent.com/s/example1.jpg",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "2", 
    nameAr: "حقائب كتف",
    nameEn: "Shoulder Bags",
    imageUrl: "https://dl.dropboxusercontent.com/s/example2.jpg",
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "3",
    nameAr: "حقائب ظهر",
    nameEn: "Backpacks", 
    imageUrl: "https://dl.dropboxusercontent.com/s/example3.jpg",
    isActive: true,
    displayOrder: 3,
  },
  {
    id: "4",
    nameAr: "محافظ",
    nameEn: "Wallets",
    imageUrl: "https://dl.dropboxusercontent.com/s/example4.jpg",
    isActive: true,
    displayOrder: 4,
  },
];

// Mock Colors
export const MOCK_COLORS: MockColor[] = [
  { id: "1", nameAr: "أسود", nameEn: "Black", hex: "#000000", displayOrder: 1 },
  { id: "2", nameAr: "أبيض", nameEn: "White", hex: "#FFFFFF", displayOrder: 2 },
  { id: "3", nameAr: "بني", nameEn: "Brown", hex: "#8B4513", displayOrder: 3 },
  { id: "4", nameAr: "أحمر", nameEn: "Red", hex: "#FF0000", displayOrder: 4 },
  { id: "5", nameAr: "أزرق", nameEn: "Blue", hex: "#0000FF", displayOrder: 5 },
  { id: "6", nameAr: "وردي", nameEn: "Pink", hex: "#FFC0CB", displayOrder: 6 },
];

// Mock Products
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    nameAr: "حقيبة يد كلاسيكية",
    nameEn: "Classic Handbag",
    descriptionAr: "حقيبة يد أنيقة مصنوعة من الجلد الطبيعي عالي الجودة",
    descriptionEn: "Elegant handbag made from high-quality genuine leather",
    price: 1200,
    compareAtPrice: 1500,
    categoryId: "1",
    mainImage: "https://dl.dropboxusercontent.com/s/product1-main.jpg",
    images: [
      "https://dl.dropboxusercontent.com/s/product1-main.jpg",
      "https://dl.dropboxusercontent.com/s/product1-2.jpg",
      "https://dl.dropboxusercontent.com/s/product1-3.jpg",
    ],
    colors: [
      { id: "1", nameAr: "أسود", nameEn: "Black", hex: "#000000" },
      { id: "3", nameAr: "بني", nameEn: "Brown", hex: "#8B4513" },
    ],
    variants: [
      { id: "1-1", colorId: "1", quantity: 10, sku: "HB-001-BLK" },
      { id: "1-2", colorId: "3", quantity: 5, sku: "HB-001-BRN" },
    ],
    tags: ["جلد طبيعي", "أنيق", "كلاسيكي"],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    nameAr: "حقيبة كتف عصرية",
    nameEn: "Modern Shoulder Bag",
    descriptionAr: "حقيبة كتف عملية ومريحة للاستخدام اليومي",
    descriptionEn: "Practical and comfortable shoulder bag for daily use",
    price: 800,
    compareAtPrice: 1000,
    categoryId: "2",
    mainImage: "https://dl.dropboxusercontent.com/s/product2-main.jpg",
    images: [
      "https://dl.dropboxusercontent.com/s/product2-main.jpg",
      "https://dl.dropboxusercontent.com/s/product2-2.jpg",
    ],
    colors: [
      { id: "2", nameAr: "أبيض", nameEn: "White", hex: "#FFFFFF" },
      { id: "6", nameAr: "وردي", nameEn: "Pink", hex: "#FFC0CB" },
    ],
    variants: [
      { id: "2-1", colorId: "2", quantity: 8, sku: "SB-002-WHT" },
      { id: "2-2", colorId: "6", quantity: 12, sku: "SB-002-PNK" },
    ],
    tags: ["عملي", "مريح", "يومي"],
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    nameAr: "حقيبة ظهر رياضية",
    nameEn: "Sports Backpack",
    descriptionAr: "حقيبة ظهر مثالية للرياضة والأنشطة الخارجية",
    descriptionEn: "Perfect backpack for sports and outdoor activities",
    price: 600,
    categoryId: "3",
    mainImage: "https://dl.dropboxusercontent.com/s/product3-main.jpg",
    images: [
      "https://dl.dropboxusercontent.com/s/product3-main.jpg",
      "https://dl.dropboxusercontent.com/s/product3-2.jpg",
      "https://dl.dropboxusercontent.com/s/product3-3.jpg",
    ],
    colors: [
      { id: "1", nameAr: "أسود", nameEn: "Black", hex: "#000000" },
      { id: "5", nameAr: "أزرق", nameEn: "Blue", hex: "#0000FF" },
    ],
    variants: [
      { id: "3-1", colorId: "1", quantity: 15, sku: "BP-003-BLK" },
      { id: "3-2", colorId: "5", quantity: 7, sku: "BP-003-BLU" },
    ],
    tags: ["رياضي", "خارجي", "متين"],
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "4",
    nameAr: "محفظة جلدية فاخرة",
    nameEn: "Luxury Leather Wallet",
    descriptionAr: "محفظة أنيقة من الجلد الطبيعي مع تصميم عملي",
    descriptionEn: "Elegant genuine leather wallet with practical design",
    price: 300,
    compareAtPrice: 400,
    categoryId: "4",
    mainImage: "https://dl.dropboxusercontent.com/s/product4-main.jpg",
    images: [
      "https://dl.dropboxusercontent.com/s/product4-main.jpg",
      "https://dl.dropboxusercontent.com/s/product4-2.jpg",
    ],
    colors: [
      { id: "1", nameAr: "أسود", nameEn: "Black", hex: "#000000" },
      { id: "3", nameAr: "بني", nameEn: "Brown", hex: "#8B4513" },
    ],
    variants: [
      { id: "4-1", colorId: "1", quantity: 20, sku: "WL-004-BLK" },
      { id: "4-2", colorId: "3", quantity: 18, sku: "WL-004-BRN" },
    ],
    tags: ["جلد", "فاخر", "عملي"],
    isActive: true,
    createdAt: "2024-01-04T00:00:00Z",
  },
];

// Mock Social Proof Videos
export const MOCK_SOCIAL_PROOF = [
  {
    id: "1",
    videoUrl: "https://dl.dropboxusercontent.com/s/video1.mp4",
    thumbnailUrl: "https://dl.dropboxusercontent.com/s/thumb1.jpg",
    titleAr: "مراجعة حقيبة اليد الكلاسيكية",
    titleEn: "Classic Handbag Review",
    productId: "1",
    isFeatured: true,
  },
  {
    id: "2", 
    videoUrl: "https://dl.dropboxusercontent.com/s/video2.mp4",
    thumbnailUrl: "https://dl.dropboxusercontent.com/s/thumb2.jpg",
    titleAr: "تجربة حقيبة الكتف العصرية",
    titleEn: "Modern Shoulder Bag Experience",
    productId: "2",
    isFeatured: true,
  },
];

// Mock Reviews
export const MOCK_REVIEWS = [
  {
    id: "1",
    productId: "1",
    customerName: "أحمد محمد",
    rating: 5,
    comment: "حقيبة رائعة وجودة ممتازة",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    productId: "1", 
    customerName: "Sara Ahmed",
    rating: 4,
    comment: "Beautiful bag, great quality!",
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "3",
    productId: "2",
    customerName: "فاطمة علي",
    rating: 5,
    comment: "مريحة جداً للاستخدام اليومي",
    createdAt: "2024-01-25T00:00:00Z",
  },
];

// Helper functions for mock data
export const getMockProducts = (categoryId?: string): MockProduct[] => {
  if (categoryId) {
    return MOCK_PRODUCTS.filter(p => p.categoryId === categoryId && p.isActive);
  }
  return MOCK_PRODUCTS.filter(p => p.isActive);
};

export const getMockProductById = (id: string): MockProduct | null => {
  return MOCK_PRODUCTS.find(p => p.id === id && p.isActive) || null;
};

export const getMockCategories = (): MockCategory[] => {
  return MOCK_CATEGORIES.filter(c => c.isActive);
};

export const getMockCategoryById = (id: string): MockCategory | null => {
  return MOCK_CATEGORIES.find(c => c.id === id && c.isActive) || null;
};

export const getMockColors = (): MockColor[] => {
  return MOCK_COLORS;
};

export const searchMockProducts = (query: string): MockProduct[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_PRODUCTS.filter(p => 
    p.isActive && (
      p.nameAr.toLowerCase().includes(lowerQuery) ||
      p.nameEn.toLowerCase().includes(lowerQuery) ||
      p.descriptionAr?.toLowerCase().includes(lowerQuery) ||
      p.descriptionEn?.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  );
};