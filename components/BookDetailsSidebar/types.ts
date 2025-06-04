import type { BookDetailDTO, NoteItemDTO, PaginationDTO, ReadingStatus } from '@/lib/types'

// Enum i utility typy
export type TabType = 'info' | 'notes' | 'ai-chat'

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  isError?: boolean
}

export interface EditState {
  isEditing: boolean
  originalContent: string
  currentContent: string
  hasChanges: boolean
}

export interface AutosaveState {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
}

export interface FormErrors {
  content?: string[]
  general?: string
}

// Główne ViewModel typy
export interface BookDetailsSidebarViewModel {
  selectedBook: BookDetailDTO | null
  isOpen: boolean
  activeTab: TabType
  isLoading: boolean
  error: string | null
}

export interface NotesViewModel {
  notes: NoteItemDTO[]
  isLoading: boolean
  isCreating: boolean
  error: string | null
  pagination: PaginationDTO
  editingNoteId: string | null
}

export interface AIChatViewModel {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  isTyping: boolean
}

// Props interfaces
export interface BookDetailsSidebarProps {
  bookId: string | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export interface SidebarHeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onClose: () => void
}

export interface BookInfoSectionProps {
  book: BookDetailDTO
  onStatusChange: (status: ReadingStatus) => void
  onRatingChange: (rating: number) => void
  onBookUpdate?: (book: Partial<BookDetailDTO>) => void
  onBookDelete?: (bookId: string) => void
}

export interface NotesSectionProps {
  bookId: string
  notes: NoteItemDTO[]
  isLoading: boolean
  error: string | null
  pagination: PaginationDTO
  onCreateNote: (content: string) => Promise<void>
  onUpdateNote: (id: string, content: string) => Promise<void>
  onDeleteNote: (id: string) => Promise<void>
  onLoadMore: () => void
}

export interface AddNoteFormProps {
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
  maxLength?: number
}

export interface NotesListProps {
  notes: NoteItemDTO[]
  isLoading: boolean
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  onToggleEdit: (id: string) => void
  editingNoteId: string | null
}

export interface NoteItemProps {
  note: NoteItemDTO
  isEditing: boolean
  onEdit: (content: string) => void
  onDelete: () => void
  onToggleEdit: () => void
}

export interface InlineNoteEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
  onCancel: () => void
  autoSave?: boolean
  debounceMs?: number
}

export interface AIChatSectionProps {
  bookId: string
  messages: ChatMessage[]
  isLoading: boolean
  onSendMessage: (content: string) => void
}

export interface ChatHistoryProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void
  isLoading: boolean
  placeholder?: string
} 