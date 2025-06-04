'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Eye, CheckCircle } from 'lucide-react'
import type { StatusSelectorProps } from './types'
import type { ReadingStatus } from '@/lib/types'

const statusOptions = [
  { value: 'want_to_read' as ReadingStatus, label: 'Chcę przeczytać', icon: Eye },
  { value: 'reading' as ReadingStatus, label: 'Czytam', icon: BookOpen },
  { value: 'finished' as ReadingStatus, label: 'Przeczytane', icon: CheckCircle }
]

export function StatusSelector({ currentStatus, onChange, isLoading, className }: StatusSelectorProps) {
  const currentOption = statusOptions.find(option => option.value === currentStatus)

  return (
    <Select
      value={currentStatus || undefined}
      onValueChange={(value: string) => onChange(value as ReadingStatus)}
      disabled={isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Wybierz status">
          {currentOption && (
            <div className="flex items-center gap-2">
              <currentOption.icon className="h-4 w-4" />
              <span>{currentOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <option.icon className="h-4 w-4" />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 