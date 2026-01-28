import { kv } from '@vercel/kv';

export async function GET() {
  try {
    await kv.ping();
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
