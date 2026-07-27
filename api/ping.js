export default async function handler(req, res) {
  const KEY = process.env.SUPABASE_ANON_KEY;
  const r = await fetch(
    'https://dedyworlrfalwoujwkyx.supabase.co/storage/v1/object/list/course-materials',
    {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix: '', limit: 1 })
    }
  );
  res.status(200).json({ ok: r.ok, status: r.status, at: new Date().toISOString() });
}
