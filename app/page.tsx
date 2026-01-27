'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const body: any = { content };
    if (ttlSeconds) body.ttl_seconds = parseInt(ttlSeconds);
    if (maxViews) body.max_views = parseInt(maxViews);

    const res = await fetch('/api/pastes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Error creating paste');
      return;
    }

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Paste</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste content"
          rows={10}
          style={{ width: '100%' }}
          required
        />
        <input
          type="number"
          value={ttlSeconds}
          onChange={(e) => setTtlSeconds(e.target.value)}
          placeholder="TTL seconds (optional, min 1)"
          style={{ display: 'block', margin: '10px 0' }}
        />
        <input
          type="number"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
          placeholder="Max views (optional, min 1)"
          style={{ display: 'block', margin: '10px 0' }}
        />
        <button type="submit">Create</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div>
          <p>Paste created!</p>
          <a href={result.url}>{result.url}</a>
        </div>
      )}
    </div>
  );
}