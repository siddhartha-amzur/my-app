import { useRef, useState } from 'react';

interface DataSourceUploaderProps {
  disabled?: boolean;
  onUpload: (file: File, selectedSheet?: string) => Promise<void>;
}

export default function DataSourceUploader({ disabled, onUpload }: DataSourceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    await onUpload(file);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        void handleFile(file);
      }}
      style={{
        border: `1px dashed ${dragActive ? '#5b7bd5' : '#c7d2ea'}`,
        borderRadius: '12px',
        padding: '12px',
        background: dragActive ? '#eef3ff' : '#fafcff',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".csv,.xlsx"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 600, color: '#1d2742', fontSize: '13px' }}>Upload CSV or Excel</div>
          <div style={{ color: '#657491', fontSize: '12px' }}>Drag and drop supported. Max 10MB.</div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          style={{ borderRadius: '10px', border: '1px solid #d0d6e7', background: 'white', padding: '8px 10px', cursor: 'pointer' }}
        >
          Choose File
        </button>
      </div>
    </div>
  );
}
