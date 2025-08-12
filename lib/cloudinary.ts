import { v2 as cloudinary } from 'cloudinary'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure Cloudinary if credentials are available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export default cloudinary

// Helper function to upload image (with fallback to local storage)
export const uploadImage = async (file: Buffer, folder: string = 'humjoli', filename?: string): Promise<string> => {
  // Check if Cloudinary is configured
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(file)
      })

      return (result as any).secure_url
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      // Fallback to local storage
      console.log('Falling back to local storage...')
    }
  }

  // Fallback to local storage
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    const timestamp = Date.now()
    const finalFilename = filename || `${timestamp}-image.jpg`
    const filepath = join(uploadsDir, finalFilename)
    
    await writeFile(filepath, file)
    return `/uploads/${finalFilename}`
  } catch (error) {
    console.error('Error saving to local storage:', error)
    throw new Error('Failed to upload image')
  }
}

// Helper function to extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url.includes('cloudinary')) return null
  
  try {
    // Example URL: https://res.cloudinary.com/dyafmztcx/image/upload/v1754984987/humjoli/inventory/praerexxhjmdwuupb0tq.jpg
    // Expected public ID: humjoli/inventory/praerexxhjmdwuupb0tq
    const urlParts = url.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    
    if (uploadIndex === -1) return null
    
    // Get everything after 'upload' and before the version
    const pathAfterUpload = urlParts.slice(uploadIndex + 2) // Skip 'upload' and version
    const publicId = pathAfterUpload.join('/').split('.')[0] // Remove file extension
    
    return publicId
  } catch (error) {
    console.error('Error extracting public ID:', error)
    return null
  }
}

// Helper function to delete image
export const deleteImage = async (imageUrl: string): Promise<void> => {
  console.log(`Attempting to delete image: ${imageUrl}`)
  
  // If it's a Cloudinary URL, try to delete from Cloudinary
  if (imageUrl.includes('cloudinary') && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const publicId = extractPublicIdFromUrl(imageUrl)
      if (publicId) {
        console.log(`Extracted public ID: ${publicId}`)
        await cloudinary.uploader.destroy(publicId)
        console.log(`✅ Successfully deleted image from Cloudinary: ${publicId}`)
        return
      } else {
        console.log('❌ Could not extract public ID from Cloudinary URL')
      }
    } catch (error) {
      console.error('❌ Error deleting from Cloudinary:', error)
    }
  }

  // Fallback to local file deletion
  try {
    const { unlink } = await import('fs/promises')
    const { join } = await import('path')
    const { existsSync } = await import('fs')
    
    const imagePath = join(process.cwd(), 'public', imageUrl)
    if (existsSync(imagePath)) {
      await unlink(imagePath)
      console.log(`✅ Successfully deleted local file: ${imagePath}`)
    } else {
      console.log(`⚠️ Local file not found: ${imagePath}`)
    }
  } catch (error) {
    console.error('❌ Error deleting local file:', error)
  }
} 