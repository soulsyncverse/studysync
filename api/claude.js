// StudySync — Secure Gemini AI Proxy
// File: api/claude.js
// Replaces Anthropic. Keeps identical request/response shape so frontend needs no changes.
// API key is server-only — never exposed to the browser.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system, max_tokens = 500 } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages required' });
  }

  // Basic abuse guard — same as before
  const totalChars = messages.reduce((s, m) => s + (m.content?.length || 0), 0);
  if (totalChars > 3000) return res.status(400).json({ error: 'Message too long' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  // Map Anthropic-style messages → Gemini contents
  // Gemini roles: "user" | "model"  (no "assistant" role)
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }],
  }));

  // Prepend system prompt as a user/model exchange if provided
  // (Gemini 2.5 supports systemInstruction natively)
  const body = {
    systemInstruction: {
      parts: [{ text: system || 'You are a helpful UPSC/UPPCS study assistant for StudySync.' }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: max_tokens,
      temperature: 0.7,
    },
  };

  const endpoint =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();

    // Extract generated text from Gemini response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      '';

    if (!text) {
      console.error('Gemini empty response:', JSON.stringify(data));
      return res.status(500).json({ error: 'Empty response from AI' });
    }

    // Return in Anthropic-compatible shape: { content: [{ text }] }
    // Frontend reads: data.content?.[0]?.text  — no change needed there
    return res.status(200).json({ content: [{ text }] });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
