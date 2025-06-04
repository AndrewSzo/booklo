'use client'

import { useState } from 'react'
import { BasicBookInfo, ValidationErrors } from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'

interface BookBasicInfoStepProps {
  data: BasicBookInfo
  onChange: (data: BasicBookInfo) => void
  errors: ValidationErrors
}

export default function BookBasicInfoStep({ data, onChange, errors }: BookBasicInfoStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(data.cover_url || null)

  const handleFieldChange = (field: keyof BasicBookInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Proszę wybrać plik obrazu')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Obraz musi być mniejszy niż 5MB')
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // TODO: In real implementation, upload to storage service
    // For now, just use the local URL
    handleFieldChange('cover_url', url)
  }

  const handleRemoveCover = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    handleFieldChange('cover_url', '')
  }

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url)
    handleFieldChange('cover_url', url)
  }

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0]
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-foreground">Podstawowe Informacje</h3>
          <p className="text-sm text-muted-foreground">
            Wprowadź podstawowe szczegóły książki, którą chcesz dodać
          </p>
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Tytuł Książki <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Wprowadź tytuł książki"
            value={data.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className={getFieldError('title') ? 'border-destructive focus:border-destructive' : ''}
          />
          {getFieldError('title') && (
            <p className="text-sm text-destructive">{getFieldError('title')}</p>
          )}
        </div>

        {/* Author Field */}
        <div className="space-y-2">
          <Label htmlFor="author" className="text-sm font-medium">
            Autor <span className="text-destructive">*</span>
          </Label>
          <Input
            id="author"
            placeholder="Wprowadź imię i nazwisko autora"
            value={data.author}
            onChange={(e) => handleFieldChange('author', e.target.value)}
            className={getFieldError('author') ? 'border-destructive focus:border-destructive' : ''}
          />
          {getFieldError('author') && (
            <p className="text-sm text-destructive">{getFieldError('author')}</p>
          )}
        </div>

        {/* ISBN Field */}
        <div className="space-y-2">
          <Label htmlFor="isbn" className="text-sm font-medium">
            ISBN (Opcjonalne)
          </Label>
          <Input
            id="isbn"
            placeholder="Wprowadź ISBN-10 lub ISBN-13"
            value={data.isbn || ''}
            onChange={(e) => handleFieldChange('isbn', e.target.value)}
            className={getFieldError('isbn') ? 'border-destructive focus:border-destructive' : ''}
          />
          {getFieldError('isbn') && (
            <p className="text-sm text-destructive">{getFieldError('isbn')}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Przykład: 978-0-123-45678-9 lub 0123456789
          </p>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Okładka Książki (Opcjonalne)
          </Label>
          
          <div className="flex gap-4">
            {/* Cover Preview */}
            {previewUrl && (
              <div className="relative w-48 h-64 bg-muted rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Podgląd okładki książki"
                  className="w-full h-full object-contain bg-white"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={handleRemoveCover}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="flex-1 space-y-3">
              {/* File Upload */}
              <div className="border border-dashed border-muted-foreground/25 rounded-md p-4">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="cover-upload"
                  className="flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Wgraj Obraz</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG do 5MB</span>
                </Label>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="cover-url" className="text-xs text-muted-foreground">
                  Lub wprowadź adres URL obrazu
                </Label>
                <Input
                  id="cover-url"
                  placeholder="https://example.com/book-cover.jpg"
                  value={data.cover_url || ''}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Opis (Opcjonalny)
          </Label>
          <textarea
            id="description"
            placeholder="Wprowadź krótki opis książki"
            value={data.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={4}
            className={`
              flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50 resize-none
              ${getFieldError('description') ? 'border-destructive focus:border-destructive' : ''}
            `}
          />
          {getFieldError('description') && (
            <p className="text-sm text-destructive">{getFieldError('description')}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {(data.description?.length || 0)}/2000 znaków
          </p>
        </div>
      </div>
    </div>
  )
} 