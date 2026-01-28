'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    const body: any = { content: content.trim() };
    if (ttlSeconds) body.ttl_seconds = Number(ttlSeconds);
    if (maxViews) body.max_views = Number(maxViews);

    try {
      setLoading(true);

      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(text || 'Failed to create paste');
        return;
      }

      setResult(JSON.parse(text));
    } catch {
      setError('Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h1>Paste your text over here</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste content"
          style={{ width: '100%' }}
          required
        />

        <input
          type="number"
          placeholder="TTL seconds (optional)"
          value={ttlSeconds}
          onChange={(e) => setTtlSeconds(e.target.value)}
          style={{ display: 'block', marginTop: 10 }}
        />

        <input
          type="number"
          placeholder="Max views (optional)"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
          style={{ display: 'block', marginTop: 10 }}
        />

        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <p>Paste created:</p>
          <a href={result.url}>{result.url}</a>
        </div>
      )}
    </div>
  );
}
