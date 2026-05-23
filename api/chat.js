export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system = '', messages = [] } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'No messages' });
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel environment variables' });
  }

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message || JSON.stringify(data.error) || `Gemini returned ${response.status}`;
      return res.status(500).json({ error: `Google API Error: ${msg}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!reply.trim()) {
      return res.status(500).json({ error: 'Gemini returned no content' });
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
