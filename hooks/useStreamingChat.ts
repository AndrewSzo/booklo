'use client';

import { useState, useRef } from 'react';

interface UseStreamingChatOptions {
  onChunkReceived?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

export function useStreamingChat({
  onChunkReceived,
  onComplete,
  onError
}: UseStreamingChatOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendStreamingMessage = async (message: string, context?: string) => {
    if (isStreaming) return;

    setIsStreaming(true);
    setStreamingContent('');
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.content) {
                fullResponse += data.content;
                setStreamingContent(fullResponse);
                onChunkReceived?.(data.content);
              } else if (data.done) {
                onComplete?.(fullResponse);
                setIsStreaming(false);
                return fullResponse;
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // Skip malformed JSON
              continue;
            }
          }
        }
      }

      setIsStreaming(false);
      onComplete?.(fullResponse);
      return fullResponse;

    } catch (error) {
      setIsStreaming(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled
        return null;
      }
      
      onError?.(errorMessage);
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  };

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const resetStream = () => {
    setStreamingContent('');
    setIsStreaming(false);
  };

  return {
    sendStreamingMessage,
    cancelStream,
    resetStream,
    isStreaming,
    streamingContent
  };
} 