export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { system, messages } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured in Vercel' });
    }

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: formattedMessages
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
