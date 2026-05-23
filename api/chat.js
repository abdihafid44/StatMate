export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { system = '', messages = [] } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'No messages' });
  }
  const chatMessages = [{ role: 'system', content: system }, ...messages];
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
        body: JSON.stringify({
          model: 'openai',
          messages: chatMessages,
          private: true
        })
      });
      const raw = await response.text();
      let data = raw;
      try { data = JSON.parse(raw); } catch {}
      if (!response.ok) {
        lastError = `${url} returned ${response.status}: ${raw.slice(0, 200)}`;
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
        return res.status(200).json({ reply: reply.trim() });
      }
      lastError = `${url} returned no readable content`;
    } catch (e) {
      lastError = `${url} failed: ${e.message}`;
    }
  }
  // Final plain-text GET fallback
  try {
    const prompt = encodeURIComponent(
      `${system}\n\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nassistant:`
    );
    const response = await fetch(`https://text.pollinations.ai/${prompt}`);
    const text = await response.text();
    if (response.ok && text.trim()) {
      return res.status(200).json({ reply: text.trim() });
    }
    lastError = `text fallback returned ${response.status}: ${text.slice(0, 200)}`;
  } catch (e) {
    lastError = `text fallback failed: ${e.message}`;
  }
  return res.status(500).json({ error: lastError || 'All AI endpoints failed' });
}
