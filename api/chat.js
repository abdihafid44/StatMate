export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body;

  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: system },
          ...messages
        ],
        model: 'openai',
        seed: 42,
        jsonMode: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const reply = await response.text();
    return res.status(200).json({ reply: reply.trim() });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
