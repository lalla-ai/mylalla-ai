import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// ── Types ───────────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; }

// ── Constants ────────────────────────────────────────────────────────────────
const SYSTEM = `You are MyLalla, a world-class AI grant advisor. You help nonprofits, startups, researchers, and small businesses find, apply for, and win grants. You are warm, strategic, concise, and deeply knowledgeable about federal grants (NSF, NIH, SBIR, Grants.gov), state grants, foundations, and accelerators. Use markdown for structure. Keep answers under 250 words unless more detail is explicitly requested.`;

const STARTERS = [
  { icon: '🔍', text: 'Find NSF grants for AI startups under $500K' },
  { icon: '📋', text: 'What SBIR Phase I requirements do I need to know?' },
  { icon: '🏛️', text: 'Best federal grants for nonprofits in Florida' },
  { icon: '✍️', text: 'How do I write a winning executive summary?' },
  { icon: '📅', text: 'Grants closing in the next 30 days for health tech?' },
  { icon: '💡', text: 'What makes a grant proposal stand out?' },
];

// ── Gemini via /api/ask ──────────────────────────────────────────────────────
async function ask(history: Message[], userText: string): Promise<string> {
  const conversation = history.map(m => `${m.role === 'user' ? 'User' : 'MyLalla'}: ${m.content}`).join('\n');
  const prompt = `${SYSTEM}\n\n${conversation ? `Conversation:\n${conversation}\n\n` : ''}User: ${userText}\nMyLalla:`;
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.text || "I'm having trouble right now. Please try again.";
}

// ── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#76B900"/>
    <path d="M17.5 6L9 17h7.5L14.5 26l10-13H17L17.5 6z" fill="#111" strokeLinejoin="round"/>
  </svg>
);

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }, [input]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const next: Message[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await ask(messages, q);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0A0A0B' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo />
          <div>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>MyLalla</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginLeft: 8, fontFamily: 'monospace' }}>AI Grant Advisor</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#76B900', background: 'rgba(118,185,0,0.1)', border: '1px solid rgba(118,185,0,0.2)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#76B900', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Gemini 2.0 Flash
          </span>
          <a href="https://civicpath.ai" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8, transition: 'all 0.15s' }}>
            CivicPath →
          </a>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', maxWidth: 800, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, paddingTop: 40 }}>
            {/* Hero */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #7c3aed, #76B900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(118,185,0,0.2)' }}>
                <span style={{ fontSize: 32 }}>✨</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>Ask MyLalla</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>
                Your AI grant advisor. Ask about federal grants, foundations, SBIR, proposals, deadlines — anything.
              </p>
            </div>
            {/* Starters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, width: '100%', maxWidth: 680 }}>
              {STARTERS.map(s => (
                <button key={s.text} onClick={() => send(s.text)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', textAlign: 'left', fontSize: 13, color: 'rgba(255,255,255,0.7)', transition: 'all 0.15s', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#76B900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 14 }}>✨</span>
              </div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '12px 16px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? '#76B900' : 'rgba(255,255,255,0.05)',
              border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: m.role === 'user' ? '#111' : '#e5e5e5',
              fontSize: 14,
              lineHeight: 1.65,
            }}>
              {m.role === 'assistant'
                ? <div className="prose"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                : m.content
              }
            </div>
            {m.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(118,185,0,0.15)', border: '1px solid rgba(118,185,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 12, fontWeight: 700, color: '#76B900' }}>U</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#76B900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14 }}>✨</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#76B900', display: 'inline-block', animation: `bounce 1.2s ${d}ms infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 20px', maxWidth: 800, width: '100%', margin: '0 auto', flexShrink: 0 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px' }}>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask MyLalla about grants, proposals, deadlines..."
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, lineHeight: 1.6, minHeight: 24, maxHeight: 180, resize: 'none', padding: '2px 0' }}
            disabled={loading}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() ? '#76B900' : 'rgba(255,255,255,0.06)', color: input.trim() ? '#111' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', fontSize: 16 }}>
            ↑
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
          Powered by Gemini 2.0 Flash · <a href="https://civicpath.ai" style={{ color: '#76B900' }}>Full grant pipeline → CivicPath</a>
        </p>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .prose { line-height: 1.7; }
        .prose p { margin-bottom: 10px; }
        .prose ul, .prose ol { margin: 8px 0 10px 20px; }
        .prose li { margin-bottom: 4px; }
        .prose strong { color: #fff; font-weight: 700; }
        .prose code { background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 4px; font-size: 12px; }
        .prose h3 { color: #76B900; font-size: 13px; font-weight: 700; margin: 12px 0 6px; text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>
    </div>
  );
}
