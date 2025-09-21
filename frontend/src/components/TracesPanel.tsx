"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { AgentTrace, AgentSpan, TraceLogEntry } from '@/types/traces'
import { formatDistanceToNow } from 'date-fns'

interface TracesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function TracesPanel({ isOpen, onClose }: TracesPanelProps) {
  const { user, getAgentTraces, getAgentSpans } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null)
  const [logEntries, setLogEntries] = useState<TraceLogEntry[]>([])

  const fetchTracesData = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [tracesData, spansData] = await Promise.all([
        getAgentTraces(user.uid),
        getAgentSpans(user.uid)
      ])
      
      // Create combined log entries
      const entries: TraceLogEntry[] = []
      
      // Add traces
      tracesData.forEach(trace => {
        entries.push({
          id: trace.id,
          timestamp: trace.start_time?.toDate?.() || new Date(trace.start_time),
          type: 'trace',
          level: trace.status === 'failed' ? 'error' : 'info',
          message: `${trace.metadata.agent_type}: ${trace.metadata.name}`,
          data: trace,
          duration: trace.end_time && trace.start_time 
            ? (trace.end_time.toDate?.() || new Date(trace.end_time)).getTime() - 
              (trace.start_time.toDate?.() || new Date(trace.start_time)).getTime()
            : undefined
        })
      })
      
      // Add spans
      spansData.forEach(span => {
        entries.push({
          id: span.id,
          timestamp: span.start_time?.toDate?.() || new Date(span.start_time),
          type: 'span',
          level: span.status === 'failed' ? 'error' : span.error ? 'warning' : 'info',
          message: span.metadata.name,
          data: span,
          duration: span.end_time && span.start_time 
            ? (span.end_time.toDate?.() || new Date(span.end_time)).getTime() - 
              (span.start_time.toDate?.() || new Date(span.start_time)).getTime()
            : undefined
        })
      })
      
      // Sort by timestamp descending (newest first)
      entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setLogEntries(entries)
      
    } catch (error) {
      console.error('Failed to fetch traces data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, getAgentTraces, getAgentSpans])

  useEffect(() => {
    if (isOpen && user) {
      fetchTracesData()
    }
  }, [isOpen, user, fetchTracesData])

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-50 text-red-700 border-red-200'
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600'
      case 'failed': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      case 'running': return 'text-blue-600'
      default: return 'text-[#556B5D]'
    }
  }

  const renderTraceDetails = (trace: AgentTrace) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Agent Type</span>
          <span className="text-[#2F3037] font-mono text-xs bg-[#F7F5F3] px-2 py-1 rounded">{trace.metadata.agent_type}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Status</span>
          <span className={`font-medium ${getStatusStyles(trace.status)}`}>
            {trace.status}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Duration</span>
          <span className="text-[#2F3037] font-mono text-xs">
            {trace.end_time && trace.start_time 
              ? formatDuration((trace.end_time.toDate?.() || new Date(trace.end_time)).getTime() - 
                             (trace.start_time.toDate?.() || new Date(trace.start_time)).getTime())
              : 'N/A'}
          </span>
        </div>
      </div>
      
      {trace.inputs && Object.keys(trace.inputs).length > 0 && (
        <div>
          <h4 className="text-[#2F3037] font-medium mb-2 text-sm">Inputs</h4>
          <pre className="bg-[#F7F5F3] p-3 rounded-lg text-xs overflow-auto max-h-32 text-[#37322F] border border-[rgba(55,50,47,0.12)]">
            {JSON.stringify(trace.inputs, null, 2)}
          </pre>
        </div>
      )}
      
      {trace.outputs && Object.keys(trace.outputs).length > 0 && (
        <div>
          <h4 className="text-[#2F3037] font-medium mb-2 text-sm">Outputs</h4>
          <pre className="bg-[#F7F5F3] p-3 rounded-lg text-xs overflow-auto max-h-32 text-[#37322F] border border-[rgba(55,50,47,0.12)]">
            {JSON.stringify(trace.outputs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )

  const renderSpanDetails = (span: AgentSpan) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Span ID</span>
          <span className="text-[#2F3037] font-mono text-xs bg-[#F7F5F3] px-2 py-1 rounded">{span.span_id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Status</span>
          <span className={`font-medium ${getStatusStyles(span.status)}`}>
            {span.status}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Duration</span>
          <span className="text-[#2F3037] font-mono text-xs">
            {span.end_time && span.start_time 
              ? formatDuration((span.end_time.toDate?.() || new Date(span.end_time)).getTime() - 
                             (span.start_time.toDate?.() || new Date(span.start_time)).getTime())
              : 'N/A'}
          </span>
        </div>
      </div>

      {span.parent_id && (
        <div className="text-sm">
          <span className="text-[#556B5D] font-medium">Parent:</span>
          <span className="ml-2 font-mono text-xs text-[#556B5D] bg-[#F7F5F3] px-2 py-1 rounded">{span.parent_id}</span>
        </div>
      )}

      {span.error && (
        <div>
          <h4 className="text-red-700 font-medium mb-2 text-sm">Error</h4>
          <pre className="bg-red-50 p-3 rounded-lg text-xs text-red-800 overflow-auto max-h-32 border border-red-200">
            {JSON.stringify(span.error, null, 2)}
          </pre>
        </div>
      )}
      
      {span.inputs && Object.keys(span.inputs).length > 0 && (
        <div>
          <h4 className="text-[#2F3037] font-medium mb-2 text-sm">Inputs</h4>
          <pre className="bg-[#F7F5F3] p-3 rounded-lg text-xs overflow-auto max-h-32 text-[#37322F] border border-[rgba(55,50,47,0.12)]">
            {JSON.stringify(span.inputs, null, 2)}
          </pre>
        </div>
      )}
      
      {span.outputs && Object.keys(span.outputs).length > 0 && (
        <div>
          <h4 className="text-[#2F3037] font-medium mb-2 text-sm">Outputs</h4>
          <pre className="bg-[#F7F5F3] p-3 rounded-lg text-xs overflow-auto max-h-32 text-[#37322F] border border-[rgba(55,50,47,0.12)]">
            {JSON.stringify(span.outputs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="absolute inset-y-0 right-0 w-full bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] border-l border-[rgba(55,50,47,0.12)] z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgba(55,50,47,0.12)] bg-white/50">
        <h2 className="text-[#2F3037] text-lg font-medium font-sans">Agent Traces</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTracesData}
            disabled={loading}
            className="px-3 py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] hover:shadow-[0px_2px_4px_rgba(55,50,47,0.16)] overflow-hidden rounded-full flex justify-center items-center transition-all disabled:opacity-50"
          >
            <span className="text-[#37322F] text-[13px] font-medium leading-5 font-sans">
              {loading ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/70 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-[#556B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[#37322F] border-t-transparent rounded-full animate-spin mb-3"></div>
            <div className="text-[#556B5D] text-sm font-medium">Loading traces...</div>
          </div>
        ) : logEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 bg-white/70 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#556B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[#2F3037] text-base font-medium font-sans mb-2">No traces found</h3>
            <p className="text-[#556B5D] text-sm leading-relaxed">
              Agent traces will appear here when your agents start running tasks.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <div className="text-[#556B5D] text-sm font-medium mb-4 flex items-center justify-between">
                <span>{logEntries.length} entries</span>
                {selectedTrace && (
                  <button
                    type="button"
                    onClick={() => setSelectedTrace(null)}
                    className="text-[13px] text-[#37322F] hover:text-[#2F3037] font-medium transition-colors"
                  >
                    ← Back to list
                  </button>
                )}
              </div>
              
              {selectedTrace ? (
                // Details View
                <div>
                  {(() => {
                    const entry = logEntries.find(e => e.id === selectedTrace)
                    if (!entry) return <div className="text-[#556B5D]">Entry not found</div>
                    
                    return (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-[#2F3037] text-base font-medium font-sans mb-2">
                            {entry.message}
                          </h3>
                          <div className="text-[#556B5D] text-xs font-mono">
                            {entry.timestamp.toLocaleString()}
                          </div>
                        </div>
                        
                        {entry.type === 'trace' 
                          ? renderTraceDetails(entry.data as AgentTrace)
                          : renderSpanDetails(entry.data as AgentSpan)
                        }
                      </div>
                    )
                  })()}
                </div>
              ) : (
                // List View
                <div className="space-y-3">
                  {logEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedTrace(entry.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedTrace(entry.id)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="p-4 rounded-lg cursor-pointer hover:bg-white/70 bg-white/50 border border-[rgba(55,50,47,0.12)] hover:border-[rgba(55,50,47,0.2)] transition-all shadow-[0px_1px_2px_rgba(55,50,47,0.08)]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelStyles(entry.level)}`}>
                          {entry.level.toUpperCase()}
                        </span>
                        <span className="text-[#556B5D] text-xs font-mono">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-[#2F3037] text-sm font-medium mb-2 leading-relaxed">
                        {entry.message}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#556B5D] text-xs font-mono bg-[#F7F5F3] px-2 py-1 rounded">
                          {entry.type.toUpperCase()}
                        </span>
                        {entry.duration && (
                          <span className="text-[#556B5D] text-xs font-mono">
                            {formatDuration(entry.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}