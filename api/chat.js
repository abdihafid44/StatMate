
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel environment variables' });
    return res.status(500).json({
      error: 'GEMINI_API_KEY not set in Vercel environment variables'
    });
  }

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
    parts: [{ text: m.content || '' }]
  }));

  try {
      }
    );

    const data = await response.json();
    const raw = await response.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(200).json({
        reply: 'Google API Error: Could not parse the Gemini response. Please try again.'
      });
    }

    if (response.status === 429 || data.error?.message?.includes('Quota exceeded')) {
      return res.status(200).json({
        reply: '**StatMate is currently very busy!** Too many students are asking questions at once, or the Gemini project has no available quota. Please wait about 30 seconds and try again. If this keeps happening, the project owner needs to enable billing or increase Gemini API quota.'
      });
    }

    if (!response.ok) {
      const msg = data.error?.message || JSON.stringify(data.error) || `Gemini returned ${response.status}`;
      return res.status(500).json({ error: `Google API Error: ${msg}` });
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
