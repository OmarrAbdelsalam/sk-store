# SK Bags Frontend-Only Store

This Next.js application has been converted to a **frontend-only** store that uses mock data and localStorage for all functionality, except for **Dropbox integration** which remains functional for file uploads.

## 🚀 What's Changed

### ✅ Kept (Functional)
- **Dropbox Integration** - All file upload/download operations work
- **Frontend UI** - All components and pages remain functional
- **Internationalization** - Arabic/English support
- **Responsive Design** - Mobile and desktop layouts
- **Cart Functionality** - Using localStorage
- **Product Browsing** - Using mock data
- **Admin Panel UI** - Visual interface (with mock auth)

### ❌ Removed (Backend Dependencies)
- **Supabase Database** - All database calls removed
- **Backend API** - All external API calls removed (except Dropbox)
- **Real Authentication** - Replaced with mock local auth
- **Real Analytics** - Removed backend analytics
- **Real Order Management** - Replaced with localStorage

## 🛠 Technical Changes

### Dependencies Removed
- `@supabase/supabase-js` - Supabase client library

### Files Removed
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/supabase-services.ts` - All Supabase service functions
- `src/lib/api-routes.ts` - Backend API routes
- `src/lib/api.ts` - Backend API wrapper
- `src/api/admin/*` - All admin API files (except config for Dropbox)
- `src/services/admin/auth.ts` - Backend authentication service

### Files Added
- `src/constants/mockData.ts` - Mock products, categories, colors
- `src/lib/localStorage.ts` - Local storage utilities for cart/orders
- `src/lib/api/cart.ts` - Cart API using localStorage
- `src/lib/api/products.ts` - Product API utilities

### Files Modified
- `src/api/categories.ts` - Now uses mock data
- `src/api/products.ts` - Now uses mock data
- `src/api/socialProof.ts` - Now uses mock data
- `src/hooks/useCart.tsx` - Now uses localStorage
- `src/hooks/useProducts.tsx` - Now uses mock data
- `src/components/admin/pages/Login.tsx` - Mock authentication
- `src/components/admin/ProtectedRoute.tsx` - Local auth check
- `next.config.js` - Removed backend image patterns
- `.env.example` - Removed backend variables, kept Dropbox

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure Dropbox:

```env
# Dropbox Configuration (for file uploads)
DROPBOX_ACCESS_TOKEN=your_dropbox_access_token
DROPBOX_REFRESH_TOKEN=your_dropbox_refresh_token
DROPBOX_APP_KEY=your_dropbox_app_key
DROPBOX_APP_SECRET=your_dropbox_app_secret
```

### 3. Run Development Server
```bash
npm run dev
# or
yarn dev
```

## 📱 Features

### Public Store
- **Product Browsing** - View products with mock data
- **Categories** - Browse by category
- **Search** - Search products by name/description
- **Cart** - Add/remove items (stored in localStorage)
- **Checkout** - Mock checkout process
- **Reviews** - Local reviews stored in localStorage
- **Wishlist** - Local wishlist functionality

### Admin Panel
- **Login** - Mock authentication (admin@skbags.com / admin123)
- **Dashboard** - Visual dashboard with mock data
- **Product Management** - UI only (no real CRUD)
- **Order Management** - View localStorage orders
- **File Upload** - Real Dropbox integration
- **Analytics** - Mock analytics display

## 🎯 Mock Data

### Products
- 4 sample products with Arabic/English names
- Multiple images per product
- Color variants
- Price information
- Categories

### Categories
- Handbags (حقائب يد)
- Shoulder Bags (حقائب كتف)
- Backpacks (حقائب ظهر)
- Wallets (محافظ)

### Colors
- Black, White, Brown, Red, Blue, Pink
- With Arabic/English names and hex codes

## 💾 Data Storage

### localStorage Keys
- `session_id` - User session identifier
- `cart_{sessionId}` - Shopping cart data
- `orders_{sessionId}` - Order history
- `product_reviews` - Product reviews
- `wishlist` - User wishlist
- `access_token` - Mock admin authentication
- `user` - Mock user data

## 🔐 Admin Authentication

### Demo Credentials
- **Email:** admin@skbags.com
- **Password:** admin123

### How It Works
- Mock authentication using localStorage
- Token expiry simulation (1 hour)
- Protected routes with local auth check
- No real backend validation

## 📁 File Structure

```
src/
├── api/                    # Frontend API wrappers (mock data)
├── app/                    # Next.js app router
├── components/             # React components
│   ├── admin/             # Admin panel components
│   ├── cart/              # Shopping cart components
│   ├── product/           # Product components
│   └── ui/                # UI components
├── constants/             # Mock data and constants
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api/              # API utilities
│   ├── dropbox.ts        # Dropbox integration (REAL)
│   └── localStorage.ts   # Local storage utilities
└── types/                # TypeScript type definitions
```

## 🚀 Deployment

This is now a static Next.js application that can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm start
```

## ⚠️ Limitations

### What Doesn't Work
- Real user authentication
- Real order processing
- Real payment integration
- Real inventory management
- Real analytics tracking
- Backend admin operations

### What Works
- All UI functionality
- Local cart management
- Mock product browsing
- Dropbox file uploads
- Responsive design
- Internationalization

## 🔄 Converting Back to Full-Stack

To convert back to a full backend integration:

1. Reinstall backend dependencies
2. Restore removed API files
3. Update environment variables
4. Replace mock data with real API calls
5. Implement real authentication
6. Connect to real database

## 📞 Support

This is now a demo/prototype version. For production use, you'll need to implement real backend services or use the original backend integration.

## 🎨 Customization

### Adding More Mock Data
Edit `src/constants/mockData.ts` to add more:
- Products
- Categories
- Colors
- Social proof videos
- Reviews

### Modifying UI
All components remain fully functional and can be customized as needed.

### Adding Real Features
Individual features can be converted back to real backend integration by:
1. Restoring the specific API files
2. Updating the corresponding hooks/components
3. Adding necessary dependencies