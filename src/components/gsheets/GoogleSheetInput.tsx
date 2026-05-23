import { useState } from 'react';

interface GoogleSheetInputProps {
  disabled?: boolean;
  onConnect: (url: string) => Promise<void>;
}

export default function GoogleSheetInput({ disabled, onConnect }: GoogleSheetInputProps) {
  const [url, setUrl] = useState('');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
      <input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Paste public Google Sheet URL"
        disabled={disabled}
        style={{ border: '1px solid #d6dae5', borderRadius: '10px', padding: '10px 12px', outline: 'none' }}
      />
      <button
        type="button"
        disabled={disabled || !url.trim()}
        onClick={async () => {
          await onConnect(url.trim());
          setUrl('');
        }}
        style={{ border: '1px solid #d0d6e7', borderRadius: '10px', background: 'white', padding: '0 12px', cursor: 'pointer' }}
      >
        Connect
      </button>
    </div>
  );
}
