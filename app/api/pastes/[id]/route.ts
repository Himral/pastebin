export const runtime = 'nodejs';

import { kv } from '@vercel/kv';

function getNow(req: Request) {
  if (process.env.TEST_MODE === '1') {
    const h = req.headers.get('x-test-now-ms');
    if (h) return parseInt(h);
  }
  return Date.now();
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = (await kv.hgetall(`paste:${params.id}`)) as
    | Record<string, string>
    | null;

  if (!data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const now = getNow(request);

  const expires_at = data.expires_at ? parseInt(data.expires_at) : null;
  const max_views = data.max_views ? parseInt(data.max_views) : null;
  const views = data.views ? parseInt(data.views) : 0;

  if ((expires_at && now >= expires_at) || (max_views && views >= max_views)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  await kv.hincrby(`paste:${params.id}`, 'views', 1);

  return Response.json({
    content: data.content,
    remaining_views: max_views ? max_views - (views + 1) : null,
    expires_at: expires_at ? new Date(expires_at).toISOString() : null,
  });
}
