import GeneratedImage from './GeneratedImage';
import { getAttachmentUrl, type Attachment } from '../lib/api';

export interface ParsedImageResponse {
  type: 'image_generation';
  image_id: string;
  image_url: string;
  prompt: string;
}

/** Try to parse the assistant response as an image generation JSON blob. */
export function parseImageResponse(response: string): ParsedImageResponse | null {
  try {
    const parsed = JSON.parse(response);
    if (parsed && parsed.type === 'image_generation' && parsed.image_id) {
      return parsed as ParsedImageResponse;
    }
  } catch {
    // Not JSON — normal text response
  }
  return null;
}

interface ChatMessageProps {
  userMessage: string;
  assistantResponse: string;
  attachments?: Attachment[];
}

export default function ChatMessage({ userMessage, assistantResponse, attachments }: ChatMessageProps) {
  const imageResponse = parseImageResponse(assistantResponse);

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* User message bubble */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
        <div
          style={{
            maxWidth: '74%',
            background: 'linear-gradient(135deg, #2f6ed3 0%, #6141c2 100%)',
            color: 'white',
            borderRadius: '14px',
            padding: '10px 12px',
            textAlign: 'left',
          }}
        >
          {userMessage}
          {attachments && attachments.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={getAttachmentUrl(attachment.id)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    borderRadius: '999px',
                    padding: '4px 8px',
                    color: 'white',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  {attachment.original_filename}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assistant response bubble */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {imageResponse ? (
          <GeneratedImage
            imageUrl={`http://localhost:8000${imageResponse.image_url}`}
            prompt={imageResponse.prompt}
          />
        ) : (
          <div
            style={{
              maxWidth: '74%',
              background: 'white',
              color: '#1e2538',
              borderRadius: '14px',
              padding: '10px 12px',
              boxShadow: '0 2px 8px rgba(20, 34, 67, 0.08)',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
            }}
          >
            {assistantResponse}
          </div>
        )}
      </div>
    </div>
  );
}
