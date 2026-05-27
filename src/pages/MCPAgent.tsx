import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpIcon, SparklesIcon, Wrench } from 'lucide-react';
import { API_BASE_URL, getErrorMessage } from '../lib/api';

interface ToolResult {
  tool: string;
  result: string;
  args: Record<string, unknown>;
  error?: boolean;
}

interface ToolInfo {
  name: string;
  description: string;
  server: string;
  input_schema: Record<string, unknown>;
}

interface AgentMessage {
  type: 'user' | 'agent' | 'tool';
  content: string;
  timestamp: Date;
  tool?: string;
  toolResults?: ToolResult[];
}

export default function MCPAgent() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available tools on mount
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mcp/tools`);
        if (response.ok) {
          const data = await response.json();
          setTools(data);
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/mcp/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const detail = await getErrorMessage(response, `Error: ${response.statusText}`);
        throw new Error(detail);
      }

      const data = await response.json();

      if (data.success) {
        // Add agent response
        setMessages((prev) => [
          ...prev,
          {
            type: 'agent',
            content: data.message || 'Task completed successfully',
            timestamp: new Date(),
            toolResults: data.tool_results,
          },
        ]);

        // Add tool execution log if tools were used
        if ((data.tools_used || []).length > 0) {
          const toolLog = (data.tool_results || [])
            .map((tr: ToolResult) => {
              const resultText = typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result);
              return `🔧 ${tr.tool}: ${tr.error ? '❌ Error' : '✅ Success'}\nResult: ${resultText.substring(0, 200)}...`;
            })
            .join('\n\n');

          setMessages((prev) => [
            ...prev,
            {
              type: 'tool',
              content: toolLog,
              timestamp: new Date(),
              tool: data.tools_used.join(', '),
              toolResults: data.tool_results,
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'agent',
            content: `Error: ${data.error || 'Unknown error'}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'agent',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-purple-500/30 bg-black/40 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">MCP Agent</h1>
              <p className="text-sm text-purple-300">
                Multi-tool orchestration with {tools.length} available tools
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <SparklesIcon className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
                <p className="text-purple-300 text-lg">
                  Ask the agent to perform tasks using available tools
                </p>
                <p className="text-purple-500 text-sm mt-2">
                  Example: "Search arXiv for transformers and summarize"
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xl rounded-lg p-4 ${
                    msg.type === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : msg.type === 'tool'
                        ? 'bg-green-900/50 text-green-100 border border-green-700/50 rounded-bl-none'
                        : 'bg-slate-700/50 text-slate-100 border border-purple-500/30 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm font-medium mb-2">
                    {msg.type === 'user' ? '👤 You' : msg.type === 'tool' ? `🔧 ${msg.tool}` : '🤖 Agent'}
                  </p>
                  <p className="whitespace-pre-wrap text-sm break-words">{msg.content}</p>
                  {msg.toolResults && msg.toolResults.length > 0 && (
                    <details className="mt-3 pt-3 border-t border-current/20">
                      <summary className="cursor-pointer text-xs font-semibold opacity-70 hover:opacity-100">
                        Tool Details ({msg.toolResults.length})
                      </summary>
                      <div className="mt-2 space-y-2 text-xs opacity-80">
                        {msg.toolResults.map((tr, i) => (
                          <div key={i} className="bg-black/20 p-2 rounded">
                            <span className={tr.error ? 'text-red-400' : 'text-green-400'}>
                              {tr.error ? '❌' : '✅'}
                            </span>{' '}
                            <span className="font-mono">{tr.tool}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4">
              <div className="bg-slate-700/50 text-slate-100 border border-purple-500/30 rounded-lg p-4 rounded-bl-none">
                <p className="text-sm font-medium mb-2">🤖 Agent</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/30 bg-black/40 backdrop-blur p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent to perform a task..."
              disabled={loading}
              className="flex-1 bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Tools Sidebar */}
      <div className="w-80 border-l border-purple-500/30 bg-black/40 backdrop-blur flex flex-col overflow-hidden">
        <div className="p-6 border-b border-purple-500/30">
          <button
            onClick={() => setExpandedTools(!expandedTools)}
            className="flex items-center gap-2 text-white font-semibold hover:text-purple-400 transition-colors"
          >
            <Wrench className="w-5 h-5" />
            Available Tools ({tools.length})
          </button>
        </div>

        {expandedTools && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tools.map((tool) => (
              <details key={tool.name} className="group">
                <summary className="cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-purple-200 p-3 rounded-lg text-sm font-medium transition-colors">
                  <span className="inline-block group-open:rotate-180 transition-transform">▶</span> {tool.name}
                </summary>
                <div className="mt-2 ml-4 bg-slate-900/50 rounded-lg p-3 text-xs text-slate-300 space-y-2">
                  <p>
                    <span className="text-purple-400 font-semibold">Server:</span> {tool.server}
                  </p>
                  <p>
                    <span className="text-purple-400 font-semibold">Description:</span> {tool.description}
                  </p>
                  {Object.keys(tool.input_schema?.properties || {}).length > 0 && (
                    <p>
                      <span className="text-purple-400 font-semibold">Parameters:</span>{' '}
                      {Object.keys(tool.input_schema.properties).join(', ')}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}

        {!expandedTools && (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <p className="text-slate-400 text-sm">Click "Available Tools" to see all tools</p>
          </div>
        )}
      </div>
    </div>
  );
}
