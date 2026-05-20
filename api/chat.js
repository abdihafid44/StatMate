export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { system = '', messages = [] } = req.body || {};
  if (!messages.length) return res.status(400).json({ error: 'No messages' });
  const payload = {
    model: 'openai',
    messages: [{ role: 'system', content: system }, ...messages],
    private: true
  };
  const endpoints = [
    'https://gen.pollinations.ai/v1/chat/completions',
    'https://text.pollinations.ai/openai'
  ];
  let lastError = '';
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await response.text();
      let data = text;
      try { data = JSON.parse(text); } catch { /* plain text response */ }
      if (!response.ok) {
        lastError = typeof data === 'object'
          ? data.error?.message || data.error || `${url} returned ${response.status}`
          : `${url} returned ${response.status}: ${text.slice(0, 160)}`;
        continue;
      }
      const reply =
        (typeof data === 'string' && data.trim()) ||
        data.choices?.[0]?.message?.content ||
        data.reply ||
        data.text ||
        data.response ||
        data.answer ||
        '';
      if (reply.trim()) {
        return res.status(200).json({
          reply: reply.trim(),
          choices: [{ message: { role: 'assistant', content: reply.trim() } }]
        });
      }
      lastError = `${url} returned no content`;
    } catch (e) {
      lastError = e.message;
    }
  }
  return res.status(500).json({ error: lastError || 'All endpoints failed' });
}
