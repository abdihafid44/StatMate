export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { system, messages } = req.body || {};

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(200).json({ reply: 'No messages were sent to the AI.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Strict check for your Vercel API Key
    if (!apiKey) {
      return res.status(200).json({ reply: '⚙️ Configuration Error: GEMINI_API_KEY is missing in Vercel Environment Variables.' });
    }

    // 2. Format messages for Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || "" }]
    }));

    // 3. Connect directly to Google Gemini 1.5 Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system || "You are a helpful statistics tutor." }] },
        contents: formattedMessages
      })
    });

    const raw = await response.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(200).json({ reply: `☁️ Google API Error: Could not parse response.` });
    }

    // 4. Catch Google-specific errors
    if (data.error) {
      return res.status(200).json({ reply: `☁️ Google API Error: ${data.error.message}` });
    }

    // 5. Send the successful text back
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ 
        reply: text,
        choices: [{ message: { role: "assistant", content: text } }]
    });

  } catch (error) {
    console.error('Serverless Error:', error);
    return res.status(200).json({ reply: `🚨 Server Error: ${error.message}` });
  }
}
