import { kv } from '@vercel/kv';
import { customAlphabet } from 'nanoid';
import z from 'zod';

const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

const createSchema = z.object({
  content: z.string().min(1),
  ttl_seconds: z.number().int().min(1).optional(),
  max_views: z.number().int().(1).optional(),
});

function getNow(request: Request) {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const header = request.headers.get('x-test-now-ms');
    if (header) return parseInt(header);
  }
  return Date.now();
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { content, ttl_seconds, max_views } = parsed.data;

  const id = generateId();
  const now = getNow(request);

  const fields: Record<string, string | number> = {
    content,
    views: 0,
  };
  if (ttl_seconds !== undefined) {
    fields.expires_at = now + ttl_seconds * 1000;
  }
  if (max_views !== undefined) {
    fields.max_views = max_views;
  }

  await kv.hset(`paste:${id}`, fields);

  const url = `${request.headers.get('origin') || 'https://your-app.vercel.app'}/p/${id}`;

  return Response.json({ id, url });
}