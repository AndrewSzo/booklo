'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Bot, User, Loader2, History, Trash2, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiChatHistory, ChatMessage } from '@/hooks/useAiChatHistory';

interface AiChatDialogProps {
  context?: string; // Optional context about user's library
}

const QUICK_SUGGESTIONS = [
  "Poleć mi książkę na podstawie mojej biblioteki",
  "Jaka jest dobra książka fantasy dla początkujących?",
  "Podsumuj główne tematy w książce 1984",
  "Co powinienem przeczytać po Harry Potterze?"
];

export function AiChatDialog({ context }: AiChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const {
    conversations,
    currentConversationId,
    getCurrentConversation,
    createNewConversation,
    addMessageToConversation,
    deleteConversation,
    switchToConversation,
    clearAllHistory
  } = useAiChatHistory();

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];

  // Create new conversation when dialog opens if none exists
  useEffect(() => {
    if (isOpen && !currentConversationId) {
      createNewConversation();
    }
  }, [isOpen, currentConversationId, createNewConversation]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading || !currentConversationId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    addMessageToConversation(currentConversationId, userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się uzyskać odpowiedzi AI');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      addMessageToConversation(currentConversationId, assistantMessage);
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Przepraszam, napotkałem błąd. Spróbuj ponownie.',
        timestamp: new Date(),
      };
      addMessageToConversation(currentConversationId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    createNewConversation();
    setShowHistory(false);
  };

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Czat AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Asystent AI Booklo
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Historia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nowy Czat
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-4">
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="w-64 border-r border-border pr-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Historia Czatów</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllHistory}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-secondary/50 border transition-colors ${
                        conv.id === currentConversationId ? 'bg-secondary' : ''
                      }`}
                      onClick={() => {
                        switchToConversation(conv.id);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conv.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {conv.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="text-destructive hover:text-destructive p-1 h-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1 pr-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center space-y-6">
                    <div>
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Zapytaj mnie o książki, streszczenia lub rekomendacje!</p>
                      <p className="text-sm mt-2">Spróbuj: &quot;Poleć mi książkę sci-fi&quot; lub &quot;Podsumuj 1984&quot;</p>
                    </div>
                    
                    {/* Quick Suggestions */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Szybkie propozycje:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {QUICK_SUGGESTIONS.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage(suggestion)}
                            disabled={isLoading}
                            className="text-left justify-start h-auto p-3"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {message.role === 'user' ? (
                            <User className="h-6 w-6 p-1 bg-primary text-primary-foreground rounded-full" />
                          ) : (
                            <Bot className="h-6 w-6 p-1 bg-secondary text-secondary-foreground rounded-full" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <Bot className="h-6 w-6 p-1 bg-secondary text-secondary-foreground rounded-full" />
                        <div className="rounded-lg p-3 bg-secondary">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Myślę...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Zapytaj o książki, streszczenia, rekomendacje..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="min-h-[60px] resize-none"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 