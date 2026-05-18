export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body;

  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai-large',
        messages: [
          { role: 'system', content: system },
          ...messages
        ]
      })
    });

    const text = await response.text();

    // Try parsing as JSON first
    let reply;
    try {
      const data = JSON.parse(text);
      reply = data.choices?.[0]?.message?.content || data.text || data.response || text;
    } catch {
      // Pollinations sometimes returns plain text directly
      reply = text;
    }

    if (!reply || reply.trim() === '') {
      return res.status(200).json({ reply: 'No response from AI. Please try again.' });
    }

    res.status(200).json({ reply });
  } catch (e) {
    console.error('AI error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
