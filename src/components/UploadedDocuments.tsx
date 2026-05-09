import type { Document } from '../lib/api';

interface UploadedDocumentsProps {
  documents: Document[];
}

function statusLabel(status: string): string {
  if (status === 'uploading') return '⏳ Uploading';
  if (status === 'processing') return '⏳ Processing embeddings';
  if (status === 'completed') return '✅ Ready for chat';
  if (status === 'failed') return '❌ Failed';
  return status;
}

export default function UploadedDocuments({ documents }: UploadedDocumentsProps) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '10px',
        background: 'rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ color: '#e9efff', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
        Uploaded PDFs
      </div>

      {documents.length === 0 ? (
        <div style={{ color: '#b5bfd6', fontSize: '12px' }}>No PDFs uploaded in this thread yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '10px',
                padding: '8px',
              }}
            >
              <div
                title={doc.original_filename}
                style={{
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                📄 {doc.original_filename}
              </div>
              <div style={{ color: '#c7d3f0', fontSize: '11px', marginTop: '4px' }}>
                {statusLabel(doc.processing_status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
