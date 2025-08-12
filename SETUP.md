# Production Image Upload Setup

## Overview
This application now supports production-ready image uploads using Cloudinary, with automatic fallback to local storage for development.

## Quick Setup

### 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Navigate to your Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Environment Variables
Create a `.env.local` file in your project root:

```bash
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (for production image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Production Deployment
When deploying to production (Vercel, Netlify, etc.), add the same environment variables to your hosting platform.

## How It Works

### Development Mode
- If Cloudinary credentials are not provided, images are saved locally in `/public/uploads/`
- This allows development without setting up Cloudinary

### Production Mode
- Images are automatically uploaded to Cloudinary
- Automatic image optimization and CDN delivery
- Better performance and reliability

### Fallback System
- If Cloudinary upload fails, it automatically falls back to local storage
- Ensures your app never breaks due to upload issues

## Features

✅ **Automatic Image Optimization** - Images are resized and optimized automatically
✅ **CDN Delivery** - Images are served from Cloudinary's global CDN
✅ **Secure URLs** - All images use HTTPS
✅ **Fallback Support** - Works even if Cloudinary is down
✅ **Development Friendly** - Works locally without Cloudinary setup
✅ **Automatic Cleanup** - Images are automatically deleted from Cloudinary when inventory items are deleted or updated

## File Structure
```
lib/
├── cloudinary.ts          # Cloudinary configuration and utilities
├── prisma.ts             # Database configuration

app/api/inventory/
├── route.ts              # Create inventory items with image upload
└── [id]/route.ts         # Update/delete inventory items with image handling
```

## Testing
1. Start your development server: `npm run dev`
2. Go to the admin inventory page
3. Try uploading an image - it should work whether you have Cloudinary set up or not
4. In production, images will automatically use Cloudinary for better performance 