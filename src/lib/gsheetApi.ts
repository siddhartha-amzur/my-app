/**
 * gsheetApi.ts
 *
 * NEW file for Project 9 – Google Sheets integration.
 * Provides typed API functions for Google Sheets operations.
 * Uses the same auth pattern as lib/api.ts without modifying it.
 *
 * Does NOT modify any existing files.
 */

const API_BASE_URL = 'http://localhost:8000/api';
const ACCESS_TOKEN_KEY = 'ai_forge_access_token';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const err = await response.json();
    if (typeof err?.detail === 'string') return err.detail;
    if (err?.detail?.message) return err.detail.message;
    if (err?.message) return err.message;
  } catch {
    // ignore
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GSheetConnectV2Response {
  source_id: string;
  sheet_name: string;
  spreadsheet_title: string;
  columns: string[];
  preview_rows: Record<string, unknown>[];
  total_rows: number;
  sheet_url: string;
  sheet_id: string;
  gid: string;
}

export interface GSheetAnalysisResult {
  source_type: string;
  generated_sql: string | null;
  sql_explanation: string | null;
  summary: string;
  pagination: {
    page: number;
    page_size: number;
    total_rows: number;
    has_more: boolean;
  };
  columns: string[];
  rows: Record<string, unknown>[];
  chart_hints: Record<string, unknown>;
}

export interface GSheetAnalyzeResponse {
  thread_id: string;
  result: GSheetAnalysisResult;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Connect a Google Sheet using the service-account v2 endpoint.
 * Falls back gracefully to the existing public-CSV approach on the backend
 * when service-account credentials are not configured.
 */
export async function connectGoogleSheetV2(
  threadId: string,
  url: string,
): Promise<GSheetConnectV2Response> {
  const response = await fetch(`${API_BASE_URL}/gsheets/connect/v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify({ thread_id: threadId, url }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to connect Google Sheet'));
  }

  return response.json();
}

/**
 * Analyse an active Google Sheet with a natural-language question.
 * Returns a result in the same shape as SQL chat responses.
 */
export async function analyzeGoogleSheet(
  threadId: string,
  question: string,
  page = 1,
  pageSize = 50,
): Promise<GSheetAnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/gsheets/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify({
      thread_id: threadId,
      question,
      page,
      page_size: pageSize,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Google Sheet analysis failed'));
  }

  return response.json();
}
