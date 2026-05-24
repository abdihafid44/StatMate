export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { system = '', messages = [] } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(200).json({ reply: 'No messages were sent to the AI.' });
  }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel environment variables' });
  }

  // Formatting messages for Groq (OpenAI standard)
  const formattedMessages = [];
  if (system) {
    formattedMessages.push({ role: 'system', content: system });
  }
  messages.forEach(m => {
    formattedMessages.push({ role: m.role, content: m.content || '' });
  });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Blazing fast, free model
        messages: formattedMessages
      })
    });

    const raw = await response.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(200).json({ reply: 'API Error: Could not parse response.' });
    }

    if (response.status === 429) {
      return res.status(200).json({ reply: '⏳ **StatMate is busy!** Please wait a moment and try again.' });
    }

    if (!response.ok) {
      const msg = data.error?.message || `API returned ${response.status}`;
      return res.status(500).json({ error: `Groq API Error: ${msg}` });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    if (!reply.trim()) {
      return res.status(500).json({ error: 'AI returned no content' });
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
