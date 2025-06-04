'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RatingInputProps } from './types'

export function RatingInput({ 
  currentRating, 
  onChange, 
  isLoading, 
  size = 'md', 
  className 
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleStarClick = (rating: number) => {
    if (isLoading) return
    
    // If clicking the same rating, clear it
    if (currentRating === rating) {
      onChange(null)
    } else {
      onChange(rating)
    }
  }

  const handleStarHover = (rating: number) => {
    if (!isLoading) {
      setHoverRating(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent, rating: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleStarClick(rating)
    }
    if (event.key === 'Backspace') {
      event.preventDefault()
      onChange(null)
    }
  }

  const getStarState = (starIndex: number) => {
    const displayRating = hoverRating ?? currentRating ?? 0
    return starIndex <= displayRating
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className="flex items-center gap-1" 
        onMouseLeave={handleMouseLeave}
        role="radiogroup"
        aria-label="Ocena książki"
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isActive = getStarState(starIndex)
          const isHovering = hoverRating !== null
          
          return (
            <button
              key={starIndex}
              type="button"
              disabled={isLoading}
              className={cn(
                'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm',
                isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110',
                isActive ? 'text-yellow-400' : 'text-gray-300',
                isHovering && 'transform scale-105'
              )}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              onKeyDown={(e) => handleKeyDown(e, starIndex)}
              aria-label={`Oceń ${starIndex} ${starIndex === 1 ? 'gwiazdką' : 'gwiazdkami'}`}
              aria-pressed={currentRating === starIndex}
              role="radio"
              tabIndex={starIndex === 1 ? 0 : -1}
            >
              <Star 
                className={cn(
                  sizeClasses[size],
                  isActive ? 'fill-current' : ''
                )} 
              />
            </button>
          )
        })}
      </div>
      
      {currentRating && (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onChange(null)}
          className={cn(
            'ml-2 text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Usuń ocenę"
        >
          Usuń
        </button>
      )}
    </div>
  )
} 