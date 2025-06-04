'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { AIChatSectionProps, ChatMessage } from './types'

interface AIChatSectionWithBookProps extends AIChatSectionProps {
  book?: {
    title: string;
    author: string;
    description?: string;
  };
}

export function AIChatSection({ 
  bookId, 
  messages: initialMessages = [], 
  onSendMessage,
  book 
}: AIChatSectionWithBookProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Create context about the book for AI
      const bookContext = book ? 
        `Książka: "${book.title}" autorstwa ${book.author}${book.description ? `. Opis: ${book.description}` : ''}` 
        : `ID książki: ${bookId}`

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: `Użytkownik pyta o konkretną książkę. ${bookContext}. Proszę podaj pomocne informacje o tej książce lub odpowiedz na ich pytanie w kontekście tej książki.`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się uzyskać odpowiedzi AI')
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])

      // Call the parent callback if provided
      if (onSendMessage) {
        onSendMessage(input.trim())
      }

    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error)
      setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd')
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Przepraszam, napotkałem błąd. Spróbuj ponownie.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div 
      className="h-full overflow-y-auto" 
      id="ai-chat-panel" 
      role="tabpanel" 
    >
      <div>
        <div className="flex-shrink-0 p-6 pb-4">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Czat AI</h3>
            <div className="ml-auto">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Aktywny
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="px-6">
          <div className="space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Asystent Czatu AI
                </h4>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Rozmawiaj z AI o tej książce. Zadawaj pytania, otrzymuj rekomendacje lub dyskutuj o tematach i postaciach.
                </p>
                {book && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                    <p className="text-blue-800 text-sm">
                      <strong>Gotowy do dyskusji:</strong> &quot;{book.title}&quot; autorstwa {book.author}
                    </p>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isError && (
                      <p className="text-xs text-red-500 mt-1">Nie udało się wysłać wiadomości</p>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-lg max-w-xs">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-3 w-3 text-gray-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 pt-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Zapytaj AI o tę książkę..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {isLoading ? 'AI myśli...' : 'Naciśnij Enter, aby wysłać, Shift+Enter dla nowej linii'}
              </span>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Wyślij</span>
              </Button>
            </div>
          </form>

          {/* Suggested Prompts */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Szybkie propozycje:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Podsumuj tę książkę',
                'Jakie są główne tematy?',
                'Poleć podobne książki',
                'Omów postacie',
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 