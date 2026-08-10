/* Reliable server-side source for the English homepage.
   The browser keeps requesting /origin/en/, but Vercel rewrites that exact path here.
   This avoids browser-side CORS/redirect/proxy failures and keeps the existing loader unchanged. */
module.exports = async function handler(req, res) {
  const upstream = 'https://adselams.com/en/';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(upstream, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; ELNASHARGROUP/1.0; +https://nashargded2026.vercel.app/)',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).send('English source upstream returned HTTP ' + response.status);
    }

    const html = await response.text();
    if (!html || !/<html[\s>]/i.test(html)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).send('English source returned invalid HTML');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=604800');
    res.setHeader('X-Nashar-English-Source', 'server-proxy-v1');
    return res.status(200).send(html);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    const message = error && error.name === 'AbortError' ? 'English source request timed out' : 'English source request failed';
    console.error(message, error);
    return res.status(502).send(message);
  } finally {
    clearTimeout(timer);
  }
};
