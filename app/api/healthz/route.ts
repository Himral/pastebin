import { kv } from '@vercel/kv';

async function checkHealth() {
  try {
    const testKey = `health:${Date.now()}`;
    await kv.set(testKey, 'ok');
    const val = await kv.get(testKey);
    await kv.del(testKey);
    return val === 'ok';
  } catch (e) {
    return false;
  }
}

export async function GET() {
  const ok = await checkHealth();
  return Response.json({ ok }, { status: 200 });
}