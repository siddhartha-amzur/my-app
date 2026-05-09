import { useRef } from 'react';

interface AttachmentUploaderProps {
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export default function AttachmentUploader({ disabled, onFilesSelected }: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[AttachmentUploader] onChange event fired');
    console.log('[AttachmentUploader] files count:', event.target.files?.length || 0);
    
    if (event.target.files && event.target.files.length > 0) {
      // Snapshot to Array BEFORE clearing the input — FileList is a live
      // reference and gets wiped when input.value is reset.
      const snapshot = Array.from(event.target.files);
      event.target.value = ''; // reset now so same file can be re-selected
      console.log('[AttachmentUploader] calling onFilesSelected with', snapshot.length, 'files');
      onFilesSelected(snapshot);
    } else {
      console.log('[AttachmentUploader] no files selected');
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.pdf,.txt,.py,.js,.ts,.json,.html,.css,.csv,.xlsx"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          console.log('[AttachmentUploader] button clicked');
          inputRef.current?.click();
        }}
        style={{
          border: '1px solid #d6dae5',
          borderRadius: '10px',
          padding: '0 14px',
          background: disabled ? '#eef1f7' : '#ffffff',
          color: '#1d2742',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        Attach
      </button>
    </>
  );
}