/**
 * GoogleSheetCard.tsx
 *
 * NEW component for Project 9 – Google Sheets integration.
 * Shows a connected sheet card with name, row/column count,
 * preview toggle, and remove button.
 *
 * Does NOT modify any existing components.
 */
import { useState } from 'react';
import GoogleSheetPreview from './GoogleSheetPreview';

export interface ConnectedSheet {
  source_id: string;
  sheet_name: string;
  spreadsheet_title: string;
  columns: string[];
  preview_rows: Record<string, unknown>[];
  total_rows: number;
  sheet_url: string;
}

interface GoogleSheetCardProps {
  sheet: ConnectedSheet;
  onRemove?: (source_id: string) => void;
  compact?: boolean;
}

export default function GoogleSheetCard({ sheet, onRemove, compact }: GoogleSheetCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(sheet.sheet_url).catch(() => {/* ignore */});
  };

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          background: '#e8f5e9',
          border: '1px solid #a5d6a7',
          borderRadius: '8px',
          fontSize: '12px',
        }}
        data-testid="google-sheet-card-compact"
      >
        <span style={{ color: '#2e7d32', fontWeight: 600 }}>📊</span>
        <span style={{ color: '#1b5e20', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sheet.spreadsheet_title}
        </span>
        <span style={{ color: '#388e3c' }}>
          {sheet.total_rows.toLocaleString()} rows
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(sheet.source_id)}
            aria-label="Remove Google Sheet"
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'transparent',
              color: '#c62828',
              cursor: 'pointer',
              padding: '0 2px',
              fontSize: '12px',
            }}
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #c8e6c9',
        borderRadius: '12px',
        padding: '14px',
        fontSize: '13px',
      }}
      data-testid="google-sheet-card"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>📊</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#1b5e20', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sheet.spreadsheet_title}
          </div>
          <div style={{ color: '#388e3c', fontSize: '11px' }}>
            Sheet: {sheet.sheet_name}
          </div>
        </div>
        <span
          style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '2px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          ✅ Connected
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        {[
          { label: 'Rows', value: sheet.total_rows.toLocaleString() },
          { label: 'Columns', value: sheet.columns.length.toString() },
          { label: 'Sheet', value: sheet.sheet_name },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: '#f1f8e9',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#558b2f', fontWeight: 700, fontSize: '14px' }}>{value}</div>
            <div style={{ color: '#7cb342', fontSize: '10px', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Columns preview */}
      {sheet.columns.length > 0 && (
        <div style={{ marginBottom: '10px', color: '#555', fontSize: '11px' }}>
          <strong>Columns:</strong>{' '}
          {sheet.columns.slice(0, 8).join(', ')}
          {sheet.columns.length > 8 && ` …+${sheet.columns.length - 8} more`}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          style={{
            border: '1px solid #a5d6a7',
            borderRadius: '8px',
            background: showPreview ? '#e8f5e9' : 'white',
            color: '#2e7d32',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
          }}
          data-testid="toggle-preview-btn"
        >
          {showPreview ? '▲ Hide Preview' : '▼ Preview Data'}
        </button>

        <button
          type="button"
          onClick={handleCopyUrl}
          title="Copy sheet URL"
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            background: 'white',
            color: '#555',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🔗 Copy URL
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(sheet.source_id)}
            style={{
              border: '1px solid #ffcdd2',
              borderRadius: '8px',
              background: 'white',
              color: '#c62828',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              marginLeft: 'auto',
            }}
            data-testid="remove-sheet-btn"
          >
            🗑 Remove
          </button>
        )}
      </div>

      {/* Preview panel */}
      {showPreview && sheet.preview_rows.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <GoogleSheetPreview
            columns={sheet.columns}
            rows={sheet.preview_rows}
            totalRows={sheet.total_rows}
            sheetName={sheet.sheet_name}
          />
        </div>
      )}
    </div>
  );
}
