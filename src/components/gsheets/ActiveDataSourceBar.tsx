/**
 * ActiveDataSourceBar.tsx
 *
 * NEW component for Project 9 – Google Sheets integration.
 * Displays the currently active data source above the chat input.
 * Shows a green indicator + name + type + clear button.
 *
 * Does NOT modify any existing components.
 */

export interface ActiveSourceInfo {
  sourceType: string; // 'gsheet' | 'excel' | 'csv' | 'postgres'
  displayName: string;
  rowCount?: number;
}

interface ActiveDataSourceBarProps {
  source: ActiveSourceInfo | null;
  onClear?: () => void;
}

const SOURCE_ICONS: Record<string, string> = {
  gsheet: '📊',
  excel: '📗',
  csv: '📄',
  postgres: '🗄️',
};

const SOURCE_LABELS: Record<string, string> = {
  gsheet: 'Google Sheet',
  excel: 'Excel',
  csv: 'CSV',
  postgres: 'Database',
};

export default function ActiveDataSourceBar({ source, onClear }: ActiveDataSourceBarProps) {
  if (!source) return null;

  const icon = SOURCE_ICONS[source.sourceType] ?? '📁';
  const label = SOURCE_LABELS[source.sourceType] ?? source.sourceType.toUpperCase();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'linear-gradient(90deg, #e8f5e9 0%, #f1f8e9 100%)',
        border: '1px solid #a5d6a7',
        borderRadius: '8px',
        fontSize: '12px',
        marginBottom: '6px',
      }}
      data-testid="active-datasource-bar"
    >
      {/* Green pulse indicator */}
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#4caf50',
          flexShrink: 0,
          boxShadow: '0 0 0 2px #a5d6a780',
        }}
      />
      <span style={{ color: '#1b5e20', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span
        style={{
          color: '#2e7d32',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
        title={source.displayName}
      >
        {source.displayName}
      </span>
      {source.rowCount !== undefined && (
        <span style={{ color: '#558b2f', fontSize: '11px', whiteSpace: 'nowrap' }}>
          {source.rowCount.toLocaleString()} rows
        </span>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          title="Remove active data source"
          aria-label="Remove active data source"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#c62828',
            cursor: 'pointer',
            padding: '0 2px',
            fontSize: '13px',
            flexShrink: 0,
          }}
          data-testid="clear-datasource-btn"
        >
          ✕
        </button>
      )}
    </div>
  );
}
