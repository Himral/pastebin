import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

async function getPaste(id: string, now: number) {
  const data = await kv.hgetall(`paste:${id}`) as Record<string, string> | null;
  if (!data) return null;

  const paste = {
    content: data.content,
    expires_at: data.expires_at ? parseInt(data.expires_at) : null,
    max_views: data.max_views ? parseInt(data.max_views) : null,
    views: data.views ? parseInt(data.views) : 0,
  };

  if (paste.expires_at !== null && now >= paste.expires_at) {
    return null;
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return null;
  }

  // Increment views
  await kv.hincrby(`paste:${id}`, 'views', 1);

  return paste;
}

function getNow() {
  const testMode = process.env.TEST_MODE === '1';
  const heads = headers();
  if (testMode) {
    const header = heads.get('x-test-now-ms');
    if (header) return parseInt(header);
  }
  return Date.now();
}

export default async function PastePage({ params }: { params: { id: string } }) {
  const now = getNow();
  const paste = await getPaste(params.id, now);

  if (!paste) {
    notFound();
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Paste</h1>
      <pre>{paste.content}</pre>
    </div>
  );
}