import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image processing utilities for avatar uploads
export const imageUtils = {
  // Validate image file
  validateImage: (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      }
    }

    return { isValid: true }
  },

  // Resize and crop image to square
  resizeImage: (file: File, size: number = 200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set canvas size to desired dimensions
        canvas.width = size
        canvas.height = size

        // Calculate crop dimensions to maintain aspect ratio
        const minDimension = Math.min(img.width, img.height)
        const cropX = (img.width - minDimension) / 2
        const cropY = (img.height - minDimension) / 2

        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          cropX, cropY, minDimension, minDimension, // Source crop
          0, 0, size, size // Destination
        )

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to process image'))
            }
          },
          'image/jpeg',
          0.9 // Quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  },

  // Generate preview URL from file
  generatePreview: (file: File): string => {
    return URL.createObjectURL(file)
  },

  // Clean up preview URL
  revokePreview: (url: string): void => {
    URL.revokeObjectURL(url)
  }
}
