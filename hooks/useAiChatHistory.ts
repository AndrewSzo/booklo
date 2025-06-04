'use client';

import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'booklo-ai-chat-history';
const MAX_CONVERSATIONS = 10;

export function useAiChatHistory() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatConversation[];
        const conversations = parsed.map((conv: ChatConversation) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversations);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [conversations]);

  const createNewConversation = (): string => {
    const id = Date.now().toString();
    const newConversation: ChatConversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev];
      // Keep only the most recent conversations
      return updated.slice(0, MAX_CONVERSATIONS);
    });

    setCurrentConversationId(id);
    return id;
  };

  const addMessageToConversation = (conversationId: string, message: ChatMessage) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date()
          };

          // Auto-generate title from first user message
          if (conv.messages.length === 0 && message.role === 'user') {
            updatedConv.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
          }

          return updatedConv;
        }
        return conv;
      })
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  };

  const getCurrentConversation = (): ChatConversation | null => {
    if (!currentConversationId) return null;
    return conversations.find(conv => conv.id === currentConversationId) || null;
  };

  const switchToConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const clearAllHistory = () => {
    setConversations([]);
    setCurrentConversationId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    conversations,
    currentConversationId,
    getCurrentConversation,
    createNewConversation,
    addMessageToConversation,
    deleteConversation,
    switchToConversation,
    clearAllHistory
  };
} 