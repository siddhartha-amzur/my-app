interface GeneratedImageProps {
  imageUrl: string;
  prompt: string;
}

export default function GeneratedImage({ imageUrl, prompt }: GeneratedImageProps) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'generated-image.png';
    a.click();
  };

  return (
    <div
      style={{
        background: '#f0f4ff',
        border: '1px solid #c7d7f5',
        borderRadius: '14px',
        padding: '14px',
        maxWidth: '420px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#3b4a6e',
        }}
      >
        🖼️ Generated Image
      </div>

      <p
        style={{
          margin: '0 0 10px',
          fontSize: '12px',
          color: '#5a6480',
          fontStyle: 'italic',
          wordBreak: 'break-word',
        }}
      >
        "{prompt}"
      </p>

      <img
        src={imageUrl}
        alt={prompt}
        style={{
          width: '100%',
          maxWidth: '380px',
          borderRadius: '10px',
          display: 'block',
          objectFit: 'contain',
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const errMsg = document.createElement('p');
            errMsg.style.cssText = 'color:#9f2d2d;font-size:12px;margin:0';
            errMsg.textContent = 'Image could not be loaded.';
            parent.appendChild(errMsg);
          }
        }}
      />

      <button
        type="button"
        onClick={handleDownload}
        style={{
          marginTop: '10px',
          background: 'none',
          border: '1px solid #c7d7f5',
          borderRadius: '8px',
          padding: '5px 12px',
          fontSize: '12px',
          color: '#3b4a6e',
          cursor: 'pointer',
        }}
      >
        ⬇ Download
      </button>
    </div>
  );
}
