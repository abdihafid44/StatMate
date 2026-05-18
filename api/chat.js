export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body;

  try {
    const response = await fetch('https://api.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai-large',
        messages: [
          { role: 'system', content: system },
          ...messages
        ],
        private: true
      })
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'AI request failed: ' + e.message });
  }
}
