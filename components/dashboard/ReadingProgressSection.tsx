'use client'

import { BookListItemDTO } from '@/lib/types'
import { Clock, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReadingProgressSectionProps {
  books: BookListItemDTO[]
  isLoading: boolean
}

export default function ReadingProgressSection({ books, isLoading }: ReadingProgressSectionProps) {
  const handleViewReadingGoals = () => {
    console.log('Opening reading goals')
    // TODO: Navigate to reading goals
  }

  const calculateReadingStreak = () => {
    // Mock calculation - would be actual streak from user stats
    return Math.floor(Math.random() * 30) + 1
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Keep the momentum going! 📚",
      "You're doing great! 🌟",
      "Every page counts! 📖",
      "Reading streak on fire! 🔥"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Reading Progress</h2>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-16 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const readingStreak = calculateReadingStreak()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Reading Progress</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewReadingGoals}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Target className="h-4 w-4" />
          Goals
        </Button>
      </div>

      {/* Reading streak */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Reading Streak</h3>
            <p className="text-sm text-muted-foreground">{getMotivationalMessage()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Days active</span>
              <span className="font-medium text-foreground">{readingStreak} days</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((readingStreak / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Currently reading books */}
      {books.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Currently Reading ({books.length})
          </h3>
          
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex gap-3">
                  <div className="w-24 h-32 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-contain rounded bg-white"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded flex flex-col items-center justify-center text-white shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                          <path d="M8 7h8"/>
                          <path d="M8 11h8"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-medium text-foreground text-sm line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    
                    {/* Mock progress - would be actual reading progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">65%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Brak książek w trakcie czytania</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Rozpocznij czytanie książki z listy &quot;Chcę przeczytać&quot;!
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/library?status=want_to_read'}
          >
            Przeglądaj książki
          </Button>
        </div>
      )}
    </div>
  )
} 