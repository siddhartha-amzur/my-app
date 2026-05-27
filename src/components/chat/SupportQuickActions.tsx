interface SupportQuickActionsProps {
  disabled?: boolean;
  onSelect: (message: string) => void;
}

const presets = [
  {
    label: 'Create Ticket',
    message: 'Create a ticket for login issue. I cannot sign in to my account.',
  },
  {
    label: 'Check Status',
    message: 'Check my ticket status.',
  },
  {
    label: 'Update Priority',
    message: 'Update my ticket priority to high because this is blocking my work.',
  },
];

export default function SupportQuickActions({ disabled = false, onSelect }: SupportQuickActionsProps) {
  return (
    <div
      style={{
        marginBottom: '10px',
        border: '1px solid #d8e1f6',
        borderRadius: '10px',
        background: '#f7f9ff',
        padding: '10px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#28438f' }}>Ticket automation</span>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.message)}
          disabled={disabled}
          style={{
            border: '1px solid #b7c6ee',
            background: disabled ? '#d9def0' : 'white',
            color: '#223258',
            borderRadius: '999px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
