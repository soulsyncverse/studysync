// StudySync — Secure Claude AI Proxy
// File: api/claude.js
// This runs on Vercel serverless — your API key is NEVER exposed to users

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system, max_tokens = 500 } = req.body || {};
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' });

  // Basic abuse guard
  const totalChars = messages.reduce((s, m) => s + (m.content?.length || 0), 0);
  if (totalChars > 3000) return res.status(400).json({ error: 'Message too long' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,   // ← server only, never sent to browser
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        system: system || 'You are a helpful UPSC/UPPCS study assistant for StudySync.',
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
