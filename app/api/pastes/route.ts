export const runtime = 'nodejs';

import { kv } from '@vercel/kv';
import { customAlphabet } from 'nanoid';
import { z } from 'zod'; // ✅ FIXED

const generateId = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8
);

const createSchema = z.object({
  content: z.string().min(1),
  ttl_seconds: z.number().int().min(1).optional(),
  max_views: z.number().int().min(1).optional(),
});

function getNow(req: Request) {
  if (process.env.TEST_MODE === '1') {
    const h = req.headers.get('x-test-now-ms');
    if (h) return parseInt(h);
  }
  return Date.now();
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }

  const rawContent = parsed.data.content;
const content = rawContent.trim();

if (content.length === 0) {
  return Response.json({ error: 'Invalid input' }, { status: 400 });
}

const { ttl_seconds, max_views } = parsed.data;


  const id = generateId();
  const now = getNow(request);

  const data: Record<string, string | number> = {
    content,
    views: 0,
  };

  if (ttl_seconds) data.expires_at = now + ttl_seconds * 1000;
  if (max_views) data.max_views = max_views;

  await kv.hset(`paste:${id}`, data);

  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000';

  return Response.json({
    id,
    url: `${origin}/p/${id}`,
  });
}
