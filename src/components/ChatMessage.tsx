import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GeneratedImage from './GeneratedImage';
import { getAttachmentUrl, type Attachment } from '../lib/api';
import SQLQueryCard from './chat/SQLQueryCard';
import SQLResultTable from './chat/SQLResultTable';
import TicketCard from './chat/TicketCard';
import type { QueryResult } from '../types/sql';
import type { Ticket } from '../lib/api';

export interface ParsedImageResponse {
  type: 'image_generation';
  image_id: string;
  image_url: string;
  prompt: string;
}

export interface ParsedSQLResponse {
  message_type: 'sql_result';
  question: string;
  generated_sql: string | null;
  rows: Record<string, unknown>[];
  columns?: string[];
  summary: string;
  sql_explanation?: string | null;
  pagination?: {
    page: number;
    page_size: number;
    total_rows: number;
    has_more: boolean;
  };
  source_type?: string;
}

export interface ParsedTicketResponse {
  message_type: 'ticket_result';
  assistant_response: string;
  workflow_status: string;
  workflow_step: string;
  ticket?: Ticket;
}

export function parseImageResponse(response: string): ParsedImageResponse | null {
  try {
    const parsed = JSON.parse(response);
    if (parsed && parsed.type === 'image_generation' && parsed.image_id) {
      return parsed as ParsedImageResponse;
    }
  } catch { /* not JSON */ }
  return null;
}

export function parseSQLResponse(response: string): ParsedSQLResponse | null {
  try {
    const parsed = JSON.parse(response);
    if (parsed && parsed.message_type === 'sql_result' && Array.isArray(parsed.rows)) {
      return parsed as ParsedSQLResponse;
    }
  } catch { /* not JSON */ }
  return null;
}

export function parseTicketResponse(response: string): ParsedTicketResponse | null {
  try {
    const parsed = JSON.parse(response);
    if (parsed && parsed.message_type === 'ticket_result') {
      return parsed as ParsedTicketResponse;
    }
  } catch { /* not JSON */ }
  return null;
}

interface ChatMessageProps {
  userMessage: string;
  assistantResponse: string;
  attachments?: Attachment[];
  onRetrySql?: (question: string) => void;
  onRetryTicket?: () => void;
}

/** Renders assistant text as styled markdown with clickable links. */
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.75rem 0 0.4rem', color: '#1e2538' }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.65rem 0 0.35rem', color: '#1e2538' }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.55rem 0 0.3rem', color: '#2756b8' }}>{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.45rem 0 0.25rem', color: '#2756b8' }}>{children}</h4>
        ),
        p: ({ children }) => (
          <p style={{ margin: '0.35rem 0', lineHeight: 1.65 }}>{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2756b8', textDecoration: 'underline', wordBreak: 'break-word' }}
          >
            {children}
          </a>
        ),
        strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
        em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
        ul: ({ children }) => (
          <ul style={{ margin: '0.3rem 0 0.3rem 1.2rem', listStyleType: 'disc', lineHeight: 1.65 }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: '0.3rem 0 0.3rem 1.2rem', listStyleType: 'decimal', lineHeight: 1.65 }}>{children}</ol>
        ),
        li: ({ children }) => <li style={{ marginBottom: '0.15rem' }}>{children}</li>,
        code: ({ children, className }) => {
          const isBlock = Boolean(className);
          return isBlock ? (
            <code style={{
              display: 'block', background: '#f0f4fa', border: '1px solid #d1ddf5',
              borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.82rem',
              fontFamily: 'monospace', overflowX: 'auto', margin: '0.4rem 0', whiteSpace: 'pre',
            }}>{children}</code>
          ) : (
            <code style={{
              background: '#eef2fb', borderRadius: '4px', padding: '1px 5px',
              fontSize: '0.83rem', fontFamily: 'monospace', color: '#2756b8',
            }}>{children}</code>
          );
        },
        pre: ({ children }) => <pre style={{ margin: '0.4rem 0', background: 'transparent' }}>{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote style={{
            borderLeft: '3px solid #2756b8', paddingLeft: '0.75rem',
            margin: '0.4rem 0', color: '#4a5568', fontStyle: 'italic',
          }}>{children}</blockquote>
        ),
        hr: () => <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.6rem 0' }} />,
        table: ({ children }) => (
          <div style={{ overflowX: 'auto', margin: '0.5rem 0' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th style={{ border: '1px solid #d1ddf5', padding: '6px 10px', background: '#eef2fb', fontWeight: 700, textAlign: 'left' }}>{children}</th>
        ),
        td: ({ children }) => (
          <td style={{ border: '1px solid #e2e8f0', padding: '5px 10px' }}>{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function ChatMessage({ userMessage, assistantResponse, attachments, onRetrySql, onRetryTicket }: ChatMessageProps) {
  const imageResponse = parseImageResponse(assistantResponse);
  const sqlResponse = parseSQLResponse(assistantResponse);
  const ticketResponse = parseTicketResponse(assistantResponse);
  const isRagAnswer = assistantResponse.startsWith('Answer generated from uploaded documents.');

  const sqlColumns = sqlResponse?.columns?.length
    ? sqlResponse.columns
    : sqlResponse ? Object.keys(sqlResponse.rows[0] || {}) : [];

  const sqlResult: QueryResult | null = sqlResponse
    ? {
        source_type: sqlResponse.source_type || 'postgres',
        generated_sql: sqlResponse.generated_sql,
        sql_explanation: sqlResponse.sql_explanation || null,
        summary: sqlResponse.summary,
        pagination: sqlResponse.pagination || {
          page: 1, page_size: 50,
          total_rows: sqlResponse.rows.length,
          has_more: false,
        },
        columns: sqlColumns,
        rows: sqlResponse.rows,
        chart_hints: {},
      }
    : null;

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* User bubble */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
        <div style={{
          maxWidth: '74%',
          background: 'linear-gradient(135deg, #2f6ed3 0%, #6141c2 100%)',
          color: 'white', borderRadius: '14px', padding: '10px 12px', textAlign: 'left',
        }}>
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
                    background: 'rgba(255,255,255,0.18)', borderRadius: '999px',
                    padding: '4px 8px', color: 'white', fontSize: '12px', textDecoration: 'none',
                  }}
                >
                  {attachment.original_filename}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assistant bubble */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {imageResponse ? (
          <GeneratedImage
            imageUrl={`http://localhost:8000${imageResponse.image_url}`}
            prompt={imageResponse.prompt}
          />
        ) : sqlResponse && sqlResult ? (
          <div style={{ width: '100%', maxWidth: '100%' }}>
            <SQLQueryCard
              question={sqlResponse.question || userMessage}
              sql={sqlResponse.generated_sql}
              explanation={sqlResponse.sql_explanation || null}
              summary={sqlResponse.summary}
              onRetry={onRetrySql ? () => onRetrySql(sqlResponse.question || userMessage) : undefined}
            />
            <SQLResultTable result={sqlResult} />
          </div>
        ) : ticketResponse?.ticket ? (
          <div style={{ width: '100%', maxWidth: '100%' }}>
            <TicketCard
              ticket={ticketResponse.ticket}
              workflowStatus={ticketResponse.workflow_status}
              workflowStep={ticketResponse.workflow_step}
              onRetry={onRetryTicket}
            />
            <div
              style={{
                marginTop: '8px',
                maxWidth: '74%',
                background: '#f7f9ff',
                border: '1px solid #dbe4fb',
                color: '#2d3b5f',
                borderRadius: '12px',
                padding: '10px 12px',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              {ticketResponse.assistant_response}
            </div>
          </div>
        ) : (
          <div style={{
            maxWidth: '74%',
            background: isRagAnswer ? '#f4f8ff' : 'white',
            color: '#1e2538',
            borderRadius: '14px',
            padding: '10px 14px',
            border: isRagAnswer ? '1px solid #c7dafb' : '1px solid transparent',
            boxShadow: '0 2px 8px rgba(20, 34, 67, 0.08)',
            textAlign: 'left',
            fontSize: '0.92rem',
            lineHeight: 1.65,
          }}>
            {isRagAnswer && (
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2756b8', marginBottom: '6px' }}>
                📚 RAG Answer
              </div>
            )}
            <MarkdownContent content={assistantResponse} />
          </div>
        )}
      </div>
    </div>
  );
}
