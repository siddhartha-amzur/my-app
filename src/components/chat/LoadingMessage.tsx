interface LoadingMessageProps {
  text: string;
}

export default function LoadingMessage({ text }: LoadingMessageProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#687086', fontSize: '13px', textAlign: 'left' }}>
      <span
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          border: '2px solid #c7d7f5',
          borderTopColor: '#2f6ed3',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text}
    </div>
  );
}
