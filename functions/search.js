// Netlify serverless function — keeps your Anthropic API key on the server,
// never in the browser. The frontend calls THIS endpoint, not api.anthropic.com directly.
//
// Setup: in your Netlify site dashboard, go to
// Site configuration -> Environment variables -> add ANTHROPIC_API_KEY with your key
// from https://console.anthropic.com

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const subject = (payload.subject || '').toString().trim();
  const country = (payload.country || '').toString().trim();
  const language = (payload.language || '').toString().trim();
  const freeOnly = !!payload.freeOnly;

  if (!subject) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing "subject"' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing ANTHROPIC_API_KEY. Add it in your hosting provider\'s environment variables, then redeploy.' })
    };
  }

  let userMessage = `Find free online courses about: ${subject}.`;
  userMessage += language
    ? ` Preferred language: ${language}.`
    : ' Language: any is fine, prefer English if nothing else fits well.';
  if (country) {
    userMessage += ` Country context: ${country} — prioritize providers or platforms accessible and relevant to learners there, but include strong global options too.`;
  }
  if (freeOnly) {
    userMessage += ' Only include courses that offer a genuinely free certificate of completion.';
  }

  const systemPrompt = `You are Worldclass's course-finding engine. Use web search to find real, currently active free online courses matching the learner's request. Verify each course exists via search before including it — do not invent titles or URLs. Prefer well-known providers (Coursera, edX, freeCodeCamp, Khan Academy, Google, Microsoft Learn, university OpenCourseWare, national/regional MOOC platforms, reputable YouTube education channels) but any legitimate, currently live source is fine. If a language was requested, prioritize courses taught in it or with materials available in it. If a country was specified, weigh providers or platforms that are accessible, popular, or locally relevant there, without excluding excellent global options. Only mark free_certificate true if you can confirm the certificate itself is free, not just the course. Respond with ONLY valid JSON, no markdown fences, no commentary, in exactly this shape: {"courses":[{"title":string,"provider":string,"language":string,"url":string,"duration":string,"free_certificate":boolean,"why":string}],"note":string}. Include up to 6 courses, best first. Keep "why" under 18 words. Keep "note" under 25 words. Return fewer than 6 if you cannot find that many solid, verified results — never invent extras.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: 'Anthropic API error', detail: data }) };
    }
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unknown server error' }) };
  }
};
