'use client'

import { Droppable } from '@hello-pangea/dnd'
import LeadCard from './LeadCard'
import type { Lead, OutreachStatus } from '@/types'

interface KanbanColumnProps {
  status: OutreachStatus
  label: string
  labelColor: string
  leads: Lead[]
  onCardClick: (lead: Lead) => void
}

export default function KanbanColumn({ status, label, labelColor, leads, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-[220px]">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${labelColor}`}>
          {label}
        </span>
        <span className="text-[11px] text-[#444] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[80px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-[#1f1f1f] border border-[#3a3a3a]'
                : 'bg-[#141414] border border-[#1f1f1f]'
            }`}
          >
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-16">
                <p className="text-[11px] text-[#333]">Drop here</p>
              </div>
            )}
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
