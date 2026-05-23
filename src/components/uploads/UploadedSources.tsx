import type { DataSource } from '../../lib/api';

interface UploadedSourcesProps {
  items: DataSource[];
  onDelete: (sourceId: string) => Promise<void>;
}

export default function UploadedSources({ items, onDelete }: UploadedSourcesProps) {
  if (items.length === 0) {
    return <div style={{ color: '#687086', fontSize: '12px', textAlign: 'left' }}>No uploaded data sources yet.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item) => (
        <div key={item.id} style={{ border: '1px solid #e1e7f5', borderRadius: '10px', padding: '8px 10px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#213154' }}>{item.display_name}</div>
              <div style={{ fontSize: '11px', color: '#657491' }}>
                {item.source_type} · {item.row_count} rows
              </div>
            </div>
            <button
              type="button"
              onClick={() => void onDelete(item.id)}
              style={{ border: '1px solid #f0c2c2', borderRadius: '8px', background: '#fff6f6', color: '#b53c3c', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
