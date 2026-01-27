import { kv } from '@vercel/kv';

function getNow(request: Request) {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const header = request.headers.get('x-test-now-ms');
    if (header) return parseInt(header);
  }
  return Date.now();
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const now = getNow(request);
  const data = await kv.hgetall(`paste:${params.id}`) as Record<string, string> | null;
  if (!data) {
    return Response.json({ error: 'Paste not found' }, { status: 404 });
  }

  const paste = {
    content: data.content,
    expires_at: data.expires_at ? parseInt(data.expires_at) : null,
    max_views: data.max_views ? parseInt(data.max_views) : null,
    views: data.views ? parseInt(data.views) : 0,
  };

  if (paste.expires_at !== null && now >= paste.expires_at) {
    return Response.json({ error: 'Paste not found' }, { status: 404 });
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return Response.json({ error: 'Paste not found' }, { status: 404 });
  }

  // Increment views
  await kv.hincrby(`paste:${params.id}`, 'views', 1);

  const remaining_views = paste.max_views !== null ? paste.max_views - (paste.views + 1) : null;
  const expires_at = paste.expires_at ? new Date(paste.expires_at).toISOString() : null;

  return Response.json({
    content: paste.content,
    remaining_views,
    expires_at,
  });
}