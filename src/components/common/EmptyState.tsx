interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div style={{ border: '1px dashed #cfd8ec', borderRadius: '10px', padding: '14px', color: '#63718f', textAlign: 'left' }}>
      {message}
    </div>
  );
}
