"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { AgentTrace, AgentSpan, TraceLogEntry } from '@/types/traces'
import { formatDistanceToNow } from 'date-fns'
import { JsonViewer } from './TraceViewer/JsonViewer'
import { MessageViewer } from './TraceViewer/MessageViewer'
import { ToolCallViewer } from './TraceViewer/ToolCallViewer'
import { TraceTimeline } from './TraceViewer/TraceTimeline'

interface TracesPanelProps {
  isOpen: boolean
  onClose: () => void
}

type ViewMode = 'timeline' | 'list' | 'conversation'
type FilterStatus = 'all' | 'completed' | 'failed' | 'pending' | 'running'

export function TracesPanel({ isOpen, onClose }: TracesPanelProps) {
  const { user, subscribeToAgentTraces, subscribeToAgentSpans } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null)
  const [selectedSpan, setSelectedSpan] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [traces, setTraces] = useState<AgentTrace[]>([])
  const [spans, setSpans] = useState<AgentSpan[]>([])
  const [logEntries, setLogEntries] = useState<TraceLogEntry[]>([])
  const [isLiveUpdating, setIsLiveUpdating] = useState(true)

  // Helper function to safely convert timestamps to Date objects
  const toDate = useCallback((timestamp: Date | { toDate?: () => Date }): Date => {
    if (timestamp instanceof Date) {
      return timestamp
    }
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate()
    }
    return new Date(timestamp as any)
  }, [])

  const updateLogEntries = useCallback((tracesData: AgentTrace[], spansData: AgentSpan[]) => {
    const entries: TraceLogEntry[] = []

    // Add traces
    tracesData.forEach(trace => {
      entries.push({
        id: trace.id,
        timestamp: toDate(trace.start_time),
        type: 'trace',
        level: trace.status === 'failed' ? 'error' : 'info',
        message: `${trace.metadata?.agent_type || 'Unknown'}: ${trace.metadata?.name || 'Unnamed Trace'}`,
        data: trace,
        duration: trace.end_time && trace.start_time
          ? toDate(trace.end_time).getTime() - toDate(trace.start_time).getTime()
          : undefined
      })
    })

    // Add spans
    spansData.forEach(span => {
      entries.push({
        id: span.id,
        timestamp: toDate(span.start_time),
        type: 'span',
        level: span.status === 'failed' ? 'error' : span.error ? 'warning' : 'info',
        message: span.metadata?.name || 'Unnamed Span',
        data: span,
        duration: span.end_time && span.start_time
          ? toDate(span.end_time).getTime() - toDate(span.start_time).getTime()
          : undefined
      })
    })

    // Sort by timestamp descending (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setLogEntries(entries)
  }, [toDate])

  useEffect(() => {
    if (!isOpen || !isLiveUpdating) return

    setLoading(true)

    // Hardcode the user email for demo purposes
    const hardcodedUserEmail = 'florisfok5@gmail.com'

    const unsubscribeTraces = subscribeToAgentTraces(hardcodedUserEmail, (newTraces) => {
      setTraces(newTraces)
      setLoading(false)
    })

    const unsubscribeSpans = subscribeToAgentSpans(hardcodedUserEmail, (newSpans) => {
      setSpans(newSpans)
    })

    return () => {
      unsubscribeTraces()
      unsubscribeSpans()
    }
  }, [isOpen, isLiveUpdating, subscribeToAgentTraces, subscribeToAgentSpans])

  // Update log entries when traces or spans change
  useEffect(() => {
    updateLogEntries(traces, spans)
  }, [traces, spans, updateLogEntries])

  // Filter logic
  const filteredLogEntries = logEntries.filter(entry => {
    if (filterStatus === 'all') return true
    const data = entry.data as AgentTrace | AgentSpan
    return data.status === filterStatus
  })

  const filteredTraces = traces.filter(trace => {
    if (filterStatus === 'all') return true
    return trace.status === filterStatus
  })

  const filteredSpans = spans.filter(span => {
    if (filterStatus === 'all') return true
    return span.status === filterStatus
  })

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
          <span className="text-[#2F3037] font-mono text-xs bg-[#F7F5F3] px-2 py-1 rounded">{trace.metadata?.agent_type || 'Unknown'}</span>
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
              ? formatDuration(toDate(trace.end_time).getTime() - toDate(trace.start_time).getTime())
              : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#556B5D] font-medium">Trace ID</span>
          <span className="text-[#2F3037] font-mono text-xs bg-[#F7F5F3] px-2 py-1 rounded">{trace.trace_id}</span>
        </div>
      </div>

      {(() => {
        if (trace.inputs && trace.inputs.input && Array.isArray(trace.inputs.input)) {
          return <MessageViewer messages={trace.inputs.input as any[]} />
        }
        return null
      })()}

      {(() => {
        if (trace.outputs && trace.outputs.output && Array.isArray(trace.outputs.output)) {
          return <MessageViewer messages={trace.outputs.output as any[]} />
        }
        return null
      })()}

      <JsonViewer data={trace.inputs} title="Raw Inputs" />
      <JsonViewer data={trace.outputs} title="Raw Outputs" />
      <JsonViewer data={trace.metadata} title="Metadata" />
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
              ? formatDuration(toDate(span.end_time).getTime() - toDate(span.start_time).getTime())
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

      {span.error ? (
        <div>
          <h4 className="text-red-700 font-medium mb-2 text-sm">Error</h4>
          <pre className="bg-red-50 p-3 rounded-lg text-xs text-red-800 overflow-auto max-h-32 border border-red-200">
            {typeof span.error === 'string' ? span.error : JSON.stringify(span.error, null, 2)}
          </pre>
        </div>
      ) : null}
      
      {span.inputs && span.inputs.input && Array.isArray(span.inputs.input) && (
        <MessageViewer messages={span.inputs.input as any[]} />
      )}

      {span.outputs && span.outputs.output && Array.isArray(span.outputs.output) && (
        <MessageViewer messages={span.outputs.output as any[]} />
      )}

      {span.outputs && span.outputs.output && Array.isArray(span.outputs.output) &&
        span.outputs.output.some((msg: any) => msg.tool_calls) && (
        <ToolCallViewer
          toolCalls={span.outputs.output.flatMap((msg: any) => msg.tool_calls || [])}
        />
      )}

      <JsonViewer data={span.inputs} title="Raw Inputs" />
      <JsonViewer data={span.outputs} title="Raw Outputs" />
      <JsonViewer data={span.metadata} title="Metadata" />
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="absolute inset-y-0 right-0 w-full bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] border-l border-[rgba(55,50,47,0.12)] z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-[rgba(55,50,47,0.12)] bg-white/50">
        <div className="flex items-center justify-between">
          <h2 className="text-[#2F3037] text-lg font-medium font-sans">Agent Traces</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveUpdating(!isLiveUpdating)}
              className={`px-3 py-[6px] rounded-full flex justify-center items-center transition-all ${
                isLiveUpdating
                  ? 'bg-emerald-100 text-emerald-700 shadow-[0px_1px_2px_rgba(16,185,129,0.12)]'
                  : 'bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] text-[#37322F] hover:shadow-[0px_2px_4px_rgba(55,50,47,0.16)]'
              }`}
            >
              <span className="text-[13px] font-medium leading-5 font-sans">
                {isLiveUpdating ? '🔴 Live' : '⏸️ Paused'}
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

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          {/* View Mode Selector */}
          <div className="flex bg-white rounded-lg p-1 shadow-[0px_1px_2px_rgba(55,50,47,0.12)]">
            {(['timeline', 'list', 'conversation'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-[#2F3037] text-white'
                    : 'text-[#556B5D] hover:text-[#2F3037]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="text-xs bg-white border border-[rgba(55,50,47,0.12)] rounded-md px-2 py-1 text-[#2F3037] focus:outline-none focus:ring-1 focus:ring-[#2F3037]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in-0 duration-500">
            <div className="w-8 h-8 border-2 border-[#37322F] border-t-transparent rounded-full animate-spin mb-3"></div>
            <div className="text-[#556B5D] text-sm font-medium">Loading traces...</div>
            <div className="text-[#556B5D] text-xs mt-2">
              {isLiveUpdating ? '🔴 Live updates enabled' : '⏸️ Updates paused'}
            </div>
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
                <span>
                  {viewMode === 'timeline'
                    ? `${filteredTraces.length + filteredSpans.length} items`
                    : `${filteredLogEntries.length} entries`}
                </span>
                {(selectedTrace || selectedSpan) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrace(null)
                      setSelectedSpan(null)
                    }}
                    className="text-[13px] text-[#37322F] hover:text-[#2F3037] font-medium transition-colors"
                  >
                    ← Back to {viewMode}
                  </button>
                )}
              </div>
              
              {selectedTrace || selectedSpan ? (
                // Details View
                <div>
                  {(() => {
                    let entry = null
                    let data = null
                    let type = null

                    if (selectedTrace) {
                      entry = filteredLogEntries.find(e => e.id === selectedTrace)
                      data = traces.find(t => t.id === selectedTrace)
                      type = 'trace'
                    } else if (selectedSpan) {
                      entry = filteredLogEntries.find(e => e.id === selectedSpan)
                      data = spans.find(s => s.id === selectedSpan)
                      type = 'span'
                    }

                    if (!data) return <div className="text-[#556B5D]">Item not found</div>

                    return (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-[#2F3037] text-base font-medium font-sans mb-2">
                            {entry?.message || (data as any).metadata?.name || 'Unnamed Item'}
                          </h3>
                          <div className="text-[#556B5D] text-xs font-mono">
                            {entry?.timestamp.toLocaleString() || 'Unknown time'}
                          </div>
                        </div>

                        {type === 'trace'
                          ? renderTraceDetails(data as AgentTrace)
                          : renderSpanDetails(data as AgentSpan)
                        }
                      </div>
                    )
                  })()}
                </div>
              ) : viewMode === 'timeline' ? (
                // Timeline View
                <TraceTimeline
                  traces={filteredTraces}
                  spans={filteredSpans}
                  onTraceSelect={setSelectedTrace}
                  onSpanSelect={setSelectedSpan}
                />
              ) : viewMode === 'conversation' ? (
                // Conversation View
                <div className="space-y-6">
                  {filteredLogEntries.map((entry) => (
                    <div key={entry.id} className="border border-[rgba(55,50,47,0.12)] rounded-lg p-4 bg-white/50 animate-in fade-in-0 slide-in-from-left-4 duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelStyles(entry.level)}`}>
                            {entry.type.toUpperCase()}
                          </span>
                          <span className="text-[#2F3037] font-medium text-sm">
                            {entry.message}
                          </span>
                        </div>
                        <span className="text-[#556B5D] text-xs font-mono ml-auto">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </span>
                      </div>

                      {/* Show conversation data directly in this view */}
                      {(() => {
                        if (entry.type === 'trace' && (entry.data as AgentTrace).inputs?.input && Array.isArray((entry.data as AgentTrace).inputs.input)) {
                          return <MessageViewer messages={(entry.data as AgentTrace).inputs.input as any[]} />
                        }
                        return null
                      })()}
                      {(() => {
                        if (entry.type === 'trace' && (entry.data as AgentTrace).outputs?.output && Array.isArray((entry.data as AgentTrace).outputs.output)) {
                          return <MessageViewer messages={(entry.data as AgentTrace).outputs.output as any[]} />
                        }
                        return null
                      })()}
                      {(() => {
                        if (entry.type === 'span' && (entry.data as AgentSpan).inputs?.input && Array.isArray((entry.data as AgentSpan).inputs.input)) {
                          return <MessageViewer messages={(entry.data as AgentSpan).inputs.input as any[]} />
                        }
                        return null
                      })()}
                      {(() => {
                        if (entry.type === 'span' && (entry.data as AgentSpan).outputs?.output && Array.isArray((entry.data as AgentSpan).outputs.output)) {
                          return <MessageViewer messages={(entry.data as AgentSpan).outputs.output as any[]} />
                        }
                        return null
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="space-y-3">
                  {filteredLogEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => {
                        if (entry.type === 'trace') {
                          setSelectedTrace(entry.id)
                        } else {
                          setSelectedSpan(entry.id)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (entry.type === 'trace') {
                            setSelectedTrace(entry.id)
                          } else {
                            setSelectedSpan(entry.id)
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="p-4 rounded-lg cursor-pointer hover:bg-white/70 bg-white/50 border border-[rgba(55,50,47,0.12)] hover:border-[rgba(55,50,47,0.2)] transition-all duration-200 shadow-[0px_1px_2px_rgba(55,50,47,0.08)] hover:shadow-[0px_4px_8px_rgba(55,50,47,0.12)] hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-4"
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