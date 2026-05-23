import { useState } from 'react';

interface SQLQueryCardProps {
  question: string;
  sql: string | null;
  explanation: string | null;
  summary: string;
  onRetry?: () => void;
  analysisType?: 'sql' | 'gsheet' | 'excel' | 'csv';
}

export default function SQLQueryCard({ question, sql, explanation, summary, onRetry, analysisType = 'sql' }: SQLQueryCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  const analysisLabel = analysisType === 'gsheet' ? 'Google Sheet Analysis' : analysisType === 'excel' ? 'Excel Analysis' : analysisType === 'csv' ? 'CSV Analysis' : 'SQL Analysis';

  return (
    <div style={{ border: '1px solid #dbe3f4', borderRadius: '12px', background: 'white', marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
        <strong style={{ fontSize: '13px', color: '#1d2742' }}>{analysisLabel}</strong>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '0 12px 12px', textAlign: 'left' }}>
          <div style={{ color: '#4f5b78', fontSize: '12px', marginBottom: '8px' }}>Q: {question}</div>
          {sql && (
            <div style={{ marginBottom: '8px' }}>
              <pre
                style={{
                  margin: 0,
                  background: '#0f172a',
                  color: '#d1e7ff',
                  padding: '10px',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  fontSize: '12px',
                }}
              >
                {sql}
              </pre>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(sql)}
                  style={{ borderRadius: '8px', border: '1px solid #d0d6e7', background: 'white', padding: '4px 8px', cursor: 'pointer' }}
                >
                  Copy SQL
                </button>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    style={{ borderRadius: '8px', border: '1px solid #d0d6e7', background: 'white', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    Retry Query
                  </button>
                )}
              </div>
            </div>
          )}
          {explanation && <div style={{ fontSize: '12px', color: '#44506d', marginBottom: '6px' }}>{explanation}</div>}
          <div style={{ fontSize: '13px', color: '#1e2d52', fontWeight: 600 }}>{summary}</div>
        </div>
      )}
    </div>
  );
}
