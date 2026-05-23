import { useState, useRef, useEffect } from 'react';
import { AlertCircle, Play, Loader, ExternalLink, FileText } from 'lucide-react';

interface Paper {
  arxiv_id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  pdf_url: string;
  categories: string[];
  relevance_score: number;
}

interface DigestItem {
  type: string;
  paper?: Paper;
  papers_found?: number;
  topic?: string;
  stage?: string;
  iteration?: number;
  query?: string;
  message?: string;
  digest?: {
    key_findings?: string[];
    research_trends?: string[];
    research_gaps?: string[];
    summary?: string;
  };
}

export default function ResearchAgent() {
  const [topic, setTopic] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [digest, setDigest] = useState<DigestItem['digest'] | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const maxIterations = 3;
  const maxPapers = 20;

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a research topic');
      return;
    }

    setIsStreaming(true);
    setError(null);
    setPapers([]);
    setDigest(null);
    setLogs([]);

    try {
      const response = await fetch('http://localhost:8000/api/research/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          max_iterations: maxIterations,
          max_papers: maxPapers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start research');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data);

              // Add log entry
              let logMessage = '';
              switch (event.type) {
                case 'start':
                  logMessage = `Starting research on: ${event.topic}`;
                  break;
                case 'progress':
                  logMessage = `${event.stage.toUpperCase()} - Iteration ${event.iteration || 'N/A'} - Papers found: ${event.papers_found || 0}`;
                  break;
                case 'decision':
                  logMessage = `Decision: ${event.decision} (iteration ${event.iteration || 'N/A'}, papers ${event.papers_found || 0})`;
                  break;
                case 'paper_found':
                  logMessage = `📄 Found: ${event.paper?.title}`;
                  if (event.paper) {
                    setPapers((prev) => [...prev, event.paper]);
                  }
                  break;
                case 'digest':
                  logMessage = 'Research completed and digest generated';
                  if (event.digest) {
                    setDigest(event.digest);
                  }
                  break;
                case 'complete':
                  logMessage = `✅ Research complete - ${event.papers_found} papers analyzed`;
                  break;
                case 'error':
                  logMessage = `❌ Error: ${event.message}`;
                  break;
                default:
                  logMessage = JSON.stringify(event);
              }

              if (logMessage) {
                setLogs((prev) => [...prev, logMessage]);
              }
            } catch (parseError) {
              console.error('Failed to parse event:', parseError);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLogs((prev) => [...prev, `❌ Error: ${message}`]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
            🔬 Research Agent
          </h1>
          <p className="text-slate-300">Autonomous AI-powered paper research and analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <form onSubmit={handleStartResearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Research Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., quantum computing, transformer models, ..."
                    disabled={isStreaming}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-slate-300 mb-1">Max Iterations</label>
                    <input
                      type="number"
                      value={maxIterations}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Max Papers</label>
                    <input
                      type="number"
                      value={maxPapers}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isStreaming || !topic.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition"
                >
                  {isStreaming ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Start Research
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded flex gap-2 text-red-300">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streaming Console */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                📊 Research Progress
              </h2>
              <div className="bg-slate-900 rounded border border-slate-700 p-4 h-64 overflow-y-auto font-mono text-sm text-slate-300 space-y-1">
                {logs.length === 0 ? (
                  <div className="text-slate-500">Research logs will appear here...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-slate-300">
                      {log}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Papers Grid */}
            {papers.length > 0 && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  📄 Papers Found ({papers.length})
                </h2>
                <div className="space-y-3">
                  {papers.map((paper) => (
                    <div key={paper.arxiv_id} className="bg-slate-700/50 rounded p-3 border border-slate-600">
                      {/* Clickable title → arXiv abstract page */}
                      <a
                        href={`https://arxiv.org/abs/${paper.arxiv_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-purple-300 text-sm line-clamp-2 hover:text-purple-200 hover:underline flex items-start gap-1 group"
                      >
                        <span className="flex-1">{paper.title}</span>
                        <ExternalLink size={12} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>

                      <p className="text-xs text-slate-400 mt-1">
                        {paper.authors.slice(0, 2).join(', ')}
                        {paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ''}
                        {paper.published && (
                          <span className="ml-2 text-slate-500">
                            · {new Date(paper.published).getFullYear()}
                          </span>
                        )}
                      </p>

                      {paper.categories && paper.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {paper.categories.slice(0, 3).map((cat) => (
                            <span key={cat} className="text-xs bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded">{cat}</span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-300 mt-2 line-clamp-2">{paper.summary}</p>

                      {/* Resource links */}
                      <div className="flex gap-3 mt-2">
                        <a
                          href={`https://arxiv.org/abs/${paper.arxiv_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink size={11} /> Abstract
                        </a>
                        {paper.pdf_url && (
                          <a
                            href={paper.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            <FileText size={11} /> PDF
                          </a>
                        )}
                        <a
                          href={`https://arxiv.org/search/?searchtype=all&query=${encodeURIComponent(paper.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          <ExternalLink size={11} /> Related
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Digest */}
            {digest && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📋 Research Digest</h2>

                {digest.summary && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2">Summary</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{digest.summary}</p>
                  </div>
                )}

                {digest.key_findings && digest.key_findings.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-green-400 mb-2">✓ Key Findings</h3>
                    <ul className="space-y-1">
                      {digest.key_findings.map((finding, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-green-400">•</span> {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {digest.research_trends && digest.research_trends.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">→ Research Trends</h3>
                    <ul className="space-y-1">
                      {digest.research_trends.map((trend, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-blue-400">•</span> {trend}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {digest.research_gaps && digest.research_gaps.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">⚠ Research Gaps</h3>
                    <ul className="space-y-1">
                      {digest.research_gaps.map((gap, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-yellow-400">•</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resource links in digest */}
                {topic && (
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">🔗 Explore Further</h3>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://arxiv.org/search/?searchtype=all&query=${encodeURIComponent(topic)}&start=0`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <ExternalLink size={11} /> arXiv Search
                      </a>
                      <a
                        href={`https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink size={11} /> Google Scholar
                      </a>
                      <a
                        href={`https://www.semanticscholar.org/search?q=${encodeURIComponent(topic)}&sort=Relevance`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                      >
                        <ExternalLink size={11} /> Semantic Scholar
                      </a>
                      <a
                        href={`https://paperswithcode.com/search?q_meta=&q_type=&q=${encodeURIComponent(topic)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <ExternalLink size={11} /> Papers with Code
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
