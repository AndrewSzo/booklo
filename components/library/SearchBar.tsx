'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  value: string
  placeholder?: string
  onSearch: (query: string) => void
  isLoading?: boolean
  className?: string
  'data-testid'?: string
}

export default function SearchBar({
  value,
  placeholder = 'Search...',
  onSearch,
  isLoading = false,
  className = '',
  'data-testid': testId
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        onSearch(localValue)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localValue, value, onSearch])

  const handleClear = () => {
    setLocalValue('')
    onSearch('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localValue)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} data-testid={testId}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" data-testid="search-icon" />
        
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="pl-12 pr-12 h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 text-gray-700 placeholder-gray-400"
          maxLength={100}
          data-testid="search-input"
        />
        
        {localValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
            data-testid="search-clear-button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
} 