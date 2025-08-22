'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { uploadBackgroundImage, validateImageFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/utils/image-upload'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  userId: string
  onUploadSuccess: (url: string, filePath: string) => void
  onUploadError?: (error: string) => void
  className?: string
  disabled?: boolean
}

export function ImageUpload({ 
  userId, 
  onUploadSuccess, 
  onUploadError, 
  className,
  disabled = false 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setError(null)
    setSuccess(false)
    setUploadProgress(0)
  }, [])

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return

    const file = files[0]
    resetState()
    setIsUploading(true)

    try {
      // Validate file
      const validation = await validateImageFile(file)
      if (!validation.isValid) {
        const errorMessage = validation.error || 'Invalid file'
        setError(errorMessage)
        setIsUploading(false)
        onUploadError?.(errorMessage)
        toast.error(errorMessage)
        return
      }

      // Show validation success
      if (validation.dimensions) {
        toast.success(`Valid image: ${validation.dimensions.width}x${validation.dimensions.height}px`)
      }

      // Upload file
      const result = await uploadBackgroundImage(file, userId, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success && result.url && result.path) {
        setSuccess(true)
        onUploadSuccess(result.url, result.path)
        toast.success('Image uploaded successfully!')

        // Reset success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const errorMessage = result.error || 'Upload failed'
        setError(errorMessage)
        onUploadError?.(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during upload'
      setError(errorMessage)
      onUploadError?.(errorMessage)
      toast.error(errorMessage)
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [userId, onUploadSuccess, onUploadError, disabled, resetState])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect, disabled])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, isUploading])

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / (1024 * 1024))}MB`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
          "hover:border-blue-400 hover:bg-blue-50/50",
          isDragging && "border-blue-500 bg-blue-50",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "pointer-events-none",
          success && "border-green-500 bg-green-50",
          error && "border-red-500 bg-red-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : success ? (
            <Check className="w-8 h-8 text-green-500" />
          ) : error ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}

          <div className="text-center">
            {isUploading ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploading image...</p>
                <Progress value={uploadProgress} className="w-48" />
                <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
              </div>
            ) : success ? (
              <p className="text-sm font-medium text-green-700">Image uploaded successfully!</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports JPEG, PNG, WebP, GIF up to {formatFileSize(MAX_FILE_SIZE)}
                </p>
                <p className="text-xs text-gray-500">
                  Minimum size: 800x600px
                </p>
              </div>
            )}
          </div>

          {!isUploading && !success && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={disabled}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Image uploaded successfully! It will be applied to your background.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
