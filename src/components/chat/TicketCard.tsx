import type { Ticket } from '../../lib/api';

interface TicketCardProps {
  ticket: Ticket;
  workflowStatus: string;
  workflowStep: string;
  onRetry?: () => void;
}

const priorityColors: Record<string, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#ef6c00',
  urgent: '#d32f2f',
};

const statusColors: Record<string, string> = {
  open: '#2f6ed3',
  in_progress: '#00897b',
  pending: '#f9a825',
  resolved: '#2e7d32',
  closed: '#616161',
};

export default function TicketCard({ ticket, workflowStatus, workflowStep, onRetry }: TicketCardProps) {
  const statusColor = statusColors[ticket.status] || '#2f6ed3';
  const priorityColor = priorityColors[ticket.priority] || '#ff9800';

  return (
    <div
      data-testid="ticket-card"
      style={{
        maxWidth: '74%',
        width: '100%',
        background: 'white',
        border: '1px solid #d6dff2',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(20, 34, 67, 0.08)',
        padding: '12px 14px',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <strong style={{ color: '#1d2742', fontSize: '14px' }}>Support Ticket</strong>
        <span
          data-testid="ticket-status-badge"
          style={{
            background: `${statusColor}20`,
            color: statusColor,
            border: `1px solid ${statusColor}55`,
            borderRadius: '999px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {ticket.status}
        </span>
      </div>

      <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2d3b5f' }}><strong>ID:</strong> {ticket.id}</p>
      <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#2d3b5f' }}><strong>Title:</strong> {ticket.title}</p>
      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#455277' }}>{ticket.description}</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <span
          data-testid="ticket-category-badge"
          style={{
            background: '#edf2ff',
            color: '#2749b3',
            border: '1px solid #b8c7f0',
            borderRadius: '999px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {ticket.category}
        </span>
        <span
          data-testid="ticket-priority-badge"
          style={{
            background: `${priorityColor}20`,
            color: priorityColor,
            border: `1px solid ${priorityColor}55`,
            borderRadius: '999px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {ticket.priority}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div data-testid="ticket-workflow" style={{ fontSize: '12px', color: '#687086' }}>
          Workflow: <strong>{workflowStep}</strong> ({workflowStatus})
        </div>
        {workflowStatus === 'failed' && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              background: '#2749b3',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
