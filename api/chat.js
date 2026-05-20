export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body;
  if (!messages || !messages.length) return res.status(400).json({ error: 'No messages' });

  // Build a single prompt string for the GET endpoint (most reliable, no auth needed)
  const lastMsg = messages[messages.length - 1]?.content || '';
  const prompt = encodeURIComponent(lastMsg);
  const sysprompt = encodeURIComponent(system || '');

  try {
    const url = `https://text.pollinations.ai/${prompt}?model=openai&system=${sysprompt}&seed=42`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: errText });
    }

    const reply = await response.text();
    return res.status(200).json({ reply: reply.trim() });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
