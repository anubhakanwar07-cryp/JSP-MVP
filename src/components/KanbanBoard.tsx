'use client'

import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import type { Lead, OutreachStatus } from '@/types'

const COLUMNS: { status: OutreachStatus; label: string; color: string }[] = [
  { status: 'draft',        label: 'Draft',         color: 'text-[#555]' },
  { status: 'sent',         label: 'Sent',          color: 'text-blue-400' },
  { status: 'followup_due', label: 'Follow-up Due', color: 'text-orange-400' },
  { status: 'followed_up',  label: 'Followed Up',   color: 'text-yellow-400' },
  { status: 'replied',      label: 'Replied',       color: 'text-green-400' },
  { status: 'cold',         label: 'Cold / Closed', color: 'text-[#444]' },
]

interface KanbanBoardProps {
  leads: Lead[]
  onStatusChange: (leadId: string, newStatus: OutreachStatus) => void
  onCardClick: (lead: Lead) => void
}

export default function KanbanBoard({ leads, onStatusChange, onCardClick }: KanbanBoardProps) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId as OutreachStatus
    const lead = leads.find((l) => l.id === draggableId)
    if (!lead || lead.outreach_status === newStatus) return
    onStatusChange(draggableId, newStatus)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            labelColor={col.color}
            leads={leads.filter((l) => l.outreach_status === col.status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
