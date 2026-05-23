/**
 * GoogleSheetPreview.tsx
 *
 * NEW component for Project 9 – Google Sheets integration.
 * Renders the first N rows of a Google Sheet in a modern,
 * horizontally-scrollable table with sticky headers.
 *
 * Does NOT modify any existing components.
 */

interface GoogleSheetPreviewProps {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  sheetName?: string;
  maxDisplayRows?: number;
}

export default function GoogleSheetPreview({
  columns,
  rows,
  totalRows,
  sheetName = 'Sheet1',
  maxDisplayRows = 50,
}: GoogleSheetPreviewProps) {
  const displayRows = rows.slice(0, maxDisplayRows);

  if (columns.length === 0 || displayRows.length === 0) {
    return (
      <div style={{ color: '#888', fontSize: '12px', padding: '8px' }}>
        No data to preview.
      </div>
    );
  }

  return (
    <div data-testid="google-sheet-preview">
      {/* Meta header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '12px',
          color: '#555',
        }}
      >
        <span>
          <strong>{sheetName}</strong> — showing {displayRows.length} of{' '}
          {totalRows.toLocaleString()} rows
        </span>
        <span style={{ color: '#888' }}>{columns.length} columns</span>
      </div>

      {/* Scrollable table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          maxHeight: '320px',
          overflowY: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            minWidth: `${columns.length * 110}px`,
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: '#f1f8e9',
                    color: '#2e7d32',
                    fontWeight: 700,
                    padding: '8px 10px',
                    textAlign: 'left',
                    borderBottom: '2px solid #c8e6c9',
                    whiteSpace: 'nowrap',
                    zIndex: 1,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background: rowIndex % 2 === 0 ? 'white' : '#fafafa',
                }}
              >
                {columns.map((col) => {
                  const val = row[col];
                  const display = val === null || val === undefined ? '' : String(val);
                  return (
                    <td
                      key={col}
                      title={display}
                      style={{
                        padding: '6px 10px',
                        borderBottom: '1px solid #f0f0f0',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#333',
                      }}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalRows > maxDisplayRows && (
        <p style={{ fontSize: '11px', color: '#888', marginTop: '6px', textAlign: 'center' }}>
          Showing first {maxDisplayRows} rows. Connect and ask a question to analyse all{' '}
          {totalRows.toLocaleString()} rows.
        </p>
      )}
    </div>
  );
}
