import type { SupabaseClient } from '@/lib/supabase/server'
import type { BookDeletionAuditLog } from '@/lib/types'

export interface AuditLogEntry {
  id?: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  resource_type: 'BOOK' | 'USER' | 'TAG' | 'NOTE' | 'RATING'
  resource_id: string
  user_id: string
  metadata: Record<string, unknown>
  created_at?: string
}

export interface AuditServiceError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>
}

/**
 * Service for comprehensive audit logging of critical operations
 * Provides secure, immutable logging for compliance and forensics
 */
export class AuditService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Log a book deletion operation with full metadata
   * Critical for security auditing and compliance
   */
  async logBookDeletion(auditData: BookDeletionAuditLog): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        operation: 'DELETE',
        resource_type: 'BOOK',
        resource_id: auditData.book_id,
        user_id: auditData.deleted_by,
        metadata: {
          book_title: auditData.book_title,
          book_author: auditData.book_author,
          deleted_at: auditData.deleted_at,
          cascaded_deletions: auditData.related_data_count,
          operation_type: 'BOOK_DELETION',
          severity: 'HIGH'
        }
      }

      await this.createAuditLog(auditEntry)
      
      // Also log to console for immediate monitoring
      console.info('AUDIT: Book deletion completed', {
        bookId: auditData.book_id,
        userId: auditData.deleted_by,
        timestamp: auditData.deleted_at,
        relatedDataDeleted: auditData.related_data_count
      })

    } catch (error) {
      console.error('Failed to log book deletion audit:', error)
      // In production, this should trigger an alert since audit logging failures are critical
      throw new Error('Audit logging failed - operation should be investigated')
    }
  }

  /**
   * Create a generic audit log entry
   * All critical operations should go through this method
   */
  async createAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      // In a production environment, this would write to a dedicated audit_logs table
      // For now, we'll use console logging with structured format
      const structuredLog = {
        timestamp: new Date().toISOString(),
        operation: entry.operation,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        user_id: entry.user_id,
        metadata: entry.metadata,
        audit_id: this.generateAuditId()
      }

      // TODO: Replace with actual database insertion when audit_logs table is available
      // const { error } = await this.supabase
      //   .from('audit_logs')
      //   .insert({
      //     operation: entry.operation,
      //     resource_type: entry.resource_type,
      //     resource_id: entry.resource_id,
      //     user_id: entry.user_id,
      //     metadata: entry.metadata
      //   })

      console.info('AUDIT_LOG:', JSON.stringify(structuredLog, null, 2))

      // In production, you might also want to:
      // 1. Send to external audit system (e.g., Splunk, AWS CloudTrail)
      // 2. Trigger security monitoring alerts for high-severity operations
      // 3. Store in immutable storage for compliance

    } catch (error) {
      console.error('Critical: Audit log creation failed:', error)
      const auditError = new Error('Failed to create audit log entry') as AuditServiceError
      auditError.status = 500
      auditError.code = 'AUDIT_LOG_FAILED'
      auditError.details = { original_error: error }
      throw auditError
    }
  }

  /**
   * Generate unique audit ID for tracking
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log security-related events (authentication failures, unauthorized access attempts)
   */
  async logSecurityEvent(
    event: 'AUTH_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'PERMISSION_DENIED',
    resourceType: string,
    resourceId: string | null,
    userId: string | null,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      const securityEntry: AuditLogEntry = {
        operation: 'UPDATE', // Security events are treated as state changes
        resource_type: 'USER',
        resource_id: resourceId || 'unknown',
        user_id: userId || 'anonymous',
        metadata: {
          event_type: event,
          target_resource_type: resourceType,
          target_resource_id: resourceId,
          severity: 'CRITICAL',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }

      await this.createAuditLog(securityEntry)

    } catch (error) {
      console.error('Failed to log security event:', error)
      // Security logging failures should never be silent
      throw error
    }
  }

  /**
   * Query audit logs for a specific resource (for investigations)
   */
  async getAuditTrail(
    resourceType: string,
    resourceId: string
  ): Promise<AuditLogEntry[]> {
    try {
      // TODO: Implement when audit_logs table is available
      // const { data, error } = await this.supabase
      //   .from('audit_logs')
      //   .select('*')
      //   .eq('resource_type', resourceType)
      //   .eq('resource_id', resourceId)
      //   .order('created_at', { ascending: false })
      //   .limit(50)

      console.info(`Audit trail requested for ${resourceType}:${resourceId}`)
      return []

    } catch (error) {
      console.error('Failed to retrieve audit trail:', error)
      throw error
    }
  }
} 