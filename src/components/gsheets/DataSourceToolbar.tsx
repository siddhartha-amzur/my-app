/**
 * DataSourceToolbar.tsx
 *
 * NEW component for Project 9 – Google Sheets integration.
 * Renders a compact toolbar above / beside the chat input that gives
 * one-click access to all data-source actions:
 *   Upload Excel | Upload CSV | Connect Google Sheet | Upload PDF
 *
 * Each action triggers an inline panel (no separate page / popup).
 * Does NOT modify any existing components.
 */
import { useRef, useState } from 'react';
import GoogleSheetInput from './GoogleSheetInput';

export type ToolbarAction = 'excel' | 'csv' | 'gsheet' | 'pdf' | null;

interface DataSourceToolbarProps {
  disabled?: boolean;
  /** Called when the user submits a Google Sheet URL. */
  onConnectSheet: (url: string) => Promise<void>;
  /** Called when the user selects a file for upload. */
  onUploadFile: (file: File, selectedSheet?: string) => Promise<void>;
  /** Whether a Google Sheet connection is in progress. */
  connecting?: boolean;
}

const TOOLS: Array<{ id: ToolbarAction; label: string; icon: string; accept?: string }> = [
  { id: 'gsheet', label: 'Google Sheet', icon: '📊' },
  { id: 'excel', label: 'Excel', icon: '📗', accept: '.xlsx,.xls' },
  { id: 'csv', label: 'CSV', icon: '📄', accept: '.csv' },
  { id: 'pdf', label: 'PDF', icon: '📕', accept: '.pdf' },
];

export default function DataSourceToolbar({
  disabled,
  onConnectSheet,
  onUploadFile,
  connecting,
}: DataSourceToolbarProps) {
  const [activePanel, setActivePanel] = useState<ToolbarAction>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentAccept, setCurrentAccept] = useState('');

  const togglePanel = (id: ToolbarAction) => {
    setActivePanel((prev) => (prev === id ? null : id));
  };

  const handleToolClick = (tool: (typeof TOOLS)[number]) => {
    if (disabled) return;
    if (tool.id === 'gsheet') {
      togglePanel('gsheet');
      return;
    }
    // File upload tools – open native file picker
    setCurrentAccept(tool.accept ?? '');
    setActivePanel(null);
    setTimeout(() => {
      if (fileRef.current) {
        fileRef.current.accept = tool.accept ?? '';
        fileRef.current.click();
      }
    }, 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await onUploadFile(file);
  };

  return (
    <div style={{ marginBottom: '6px' }} data-testid="data-source-toolbar">
      {/* Toolbar buttons */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: '#687086',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          + Add Source
        </span>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            disabled={disabled}
            onClick={() => handleToolClick(tool)}
            aria-pressed={activePanel === tool.id}
            style={{
              border: `1px solid ${activePanel === tool.id ? '#1565c0' : '#d6dae5'}`,
              borderRadius: '8px',
              background: activePanel === tool.id ? '#e3f2fd' : 'white',
              color: activePanel === tool.id ? '#1565c0' : '#3d4f6e',
              padding: '5px 10px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: activePanel === tool.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
              opacity: disabled ? 0.5 : 1,
            }}
            data-testid={`toolbar-${tool.id}`}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Inline Google Sheet panel */}
      {activePanel === 'gsheet' && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            background: '#f1f8e9',
            border: '1px solid #c8e6c9',
            borderRadius: '10px',
          }}
          data-testid="gsheet-inline-panel"
        >
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '12px',
              color: '#388e3c',
              fontWeight: 600,
            }}
          >
            📊 Connect Google Sheet
          </p>
          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#555' }}>
            Share the sheet with the service account email, then paste the URL below.
          </p>
          <GoogleSheetInput
            disabled={disabled || connecting}
            onConnect={async (url) => {
              await onConnectSheet(url);
              setActivePanel(null);
            }}
          />
          {connecting && (
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#1565c0' }}>
              ⏳ Connecting…
            </p>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept={currentAccept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
}
