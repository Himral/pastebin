export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { kv } from '@vercel/kv';

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  const data = (await kv.hgetall(`paste:${params.id}`)) as
    | Record<string, string>
    | null;

  // IMPORTANT: do NOT call notFound()
  if (!data) {
    return (
      <div style={{ padding: 20 }}>
        <h1>404</h1>
        <p>Paste not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Paste</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{data.content}</pre>
    </div>
  );
}
