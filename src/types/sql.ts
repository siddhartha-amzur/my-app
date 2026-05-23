export interface QueryResultPagination {
  page: number;
  page_size: number;
  total_rows: number;
  has_more: boolean;
}

export interface QueryResult {
  source_type: string;
  generated_sql: string | null;
  sql_explanation: string | null;
  summary: string;
  pagination: QueryResultPagination;
  columns: string[];
  rows: Record<string, unknown>[];
  chart_hints: Record<string, unknown>;
}

export interface SQLHistoryItem {
  id: string;
  question: string;
  generated_sql: string;
  sql_explanation: string;
  summary: string;
  created_at: string;
}

export interface ThreadRestorePayload {
  messages: unknown[];
  sql_history: SQLHistoryItem[];
  data_sources: unknown[];
  active_context: {
    source_type: string;
    source_ref: string;
    context: Record<string, unknown>;
  } | null;
}
