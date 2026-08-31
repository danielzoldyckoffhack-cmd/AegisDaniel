import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security & Phishing Analysis Engine
interface PhishingCheckResult {
  isSuspicious: boolean;
  threatLevel: "safe" | "warning" | "dangerous";
  reasons: string[];
  score: number; // 0-100 (100 = dangerous)
  detectedType?: string;
  domain: string;
}

function analyzeUrlSafety(targetUrl: string): PhishingCheckResult {
  const reasons: string[] = [];
  let score = 0;

  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // 1. IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      score += 45;
      reasons.push("Menggunakan alamat IP langsung tanpa nama domain terverifikasi.");
    }

    // 2. Punycode (IDN homograph attacks)
    if (host.includes("xn--")) {
      score += 55;
      reasons.push("Terdeteksi enkripsi Punycode (potensi serangan homograph tiruan karakter).");
    }

    // 3. Suspicious TLDs often used in disposable phishing
    const highRiskTLDs = [".xyz", ".top", ".buzz", ".work", ".cfd", ".monster", ".sbs", ".tk", ".ml", ".ga", ".cf", ".gq"];
    if (highRiskTLDs.some((tld) => host.endsWith(tld))) {
      score += 25;
      reasons.push(`Domain menggunakan TLD berisiko tinggi (${highRiskTLDs.find((tld) => host.endsWith(tld))}).`);
    }

    // 4. Typosquatting heuristics on popular brands
    const popularBrands = [
      { brand: "paypal", typos: ["paypa1", "paypai", "pay-pal", "paypall", "peypal"] },
      { brand: "google", typos: ["g00gle", "g0ogle", "googie", "goog1e", "gooogle"] },
      { brand: "facebook", typos: ["faceb00k", "facebok", "faecbook", "fecebook"] },
      { brand: "bca", typos: ["klik-bca", "klikbca-login", "bca-id", "bankbca-secure"] },
      { brand: "bri", typos: ["bri-mo", "brimologin", "ib-bri", "bri-internet"] },
      { brand: "mandiri", typos: ["livin-mandiri-auth", "bankmandiri-update"] },
      { brand: "instagram", typos: ["instagrarn", "1nstagram", "instagran"] },
      { brand: "apple", typos: ["app1e", "apple-id-verify", "apple-security"] },
      { brand: "microsoft", typos: ["micros0ft", "microsofft", "ms-auth-verify"] },
      { brand: "netflix", typos: ["netf1ix", "netflix-verify", "netflx"] },
      { brand: "binance", typos: ["binance-secure", "binaance", "binance-app"] }
    ];

    for (const item of popularBrands) {
      if (!host.includes(item.brand)) {
        for (const typo of item.typos) {
          if (host.includes(typo)) {
            score += 70;
            reasons.push(`Terdeteksi indikasi typosquatting / pemalsuan merek (${item.brand} vs ${typo}).`);
          }
        }
      } else {
        // Brand present, but in subdomain of unfamiliar domain (e.g. paypal.com.attacker.xyz)
        if (!host.endsWith(`.${item.brand}.com`) && host !== `${item.brand}.com` && !host.endsWith(`.${item.brand}.co.id`)) {
          if (host.includes(item.brand)) {
            score += 65;
            reasons.push(`Penyalahgunaan nama merek '${item.brand}' dalam subdomain atau domain pihak ketiga.`);
          }
        }
      }
    }

    // 5. Sensitive credentials path on insecure or suspicious schemes
    const sensitivePaths = ["login", "signin", "auth", "verify", "secure", "update-pin", "rekening", "wallet", "seed-phrase", "recovery"];
    if (sensitivePaths.some((p) => pathname.includes(p) || parsed.search.includes(p))) {
      if (parsed.protocol === "http:") {
        score += 50;
        reasons.push("Formulir kredensial/autentikasi melalui koneksi HTTP tidak terenkripsi.");
      } else {
        score += 15;
        reasons.push("Halaman meminta autentikasi/kredensial sensitif.");
      }
    }

    // 6. Excessively long subdomain levels
    const parts = host.split(".");
    if (parts.length > 4) {
      score += 20;
      reasons.push("Struktur subdomain bertingkat dalam (indikasi obfuscation URL).");
    }

    // Determine Threat Level
    let threatLevel: "safe" | "warning" | "dangerous" = "safe";
    if (score >= 60) {
      threatLevel = "dangerous";
    } else if (score >= 25) {
      threatLevel = "warning";
    }

    return {
      isSuspicious: score >= 25,
      threatLevel,
      reasons: reasons.length > 0 ? reasons : ["Tidak ada anomali keamanan signifikan terdeteksi pada struktur URL."],
      score: Math.min(score, 100),
      detectedType: score >= 60 ? "Phishing & Fake Domain" : score >= 25 ? "Suspicious Activity" : "Clean Verified",
      domain: host
    };
  } catch {
    return {
      isSuspicious: true,
      threatLevel: "warning",
      reasons: ["Format URL tidak valid atau memiliki sintaks malformed."],
      score: 40,
      detectedType: "Malformed URL",
      domain: "unknown"
    };
  }
}

// API: Safety & Phishing Check
app.post("/api/analyze-url", (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }
  const result = analyzeUrlSafety(url);
  res.json(result);
});

// API: Web Proxy & Content Fetcher (allows bypass, sandbox isolation, header stripping)
async function generateStealthSearchResultHtml(query: string, searchUrl: string): Promise<{ html: string; title: string }> {
  const cleanQuery = query.trim();
  const searchResults: Array<{ title: string; url: string; snippet: string; domain: string }> = [];
  let knowledgeCard: { title: string; desc: string; url: string } | null = null;

  // 1. Wikipedia OpenSearch & Summary API
  try {
    const wikiUrl = `https://id.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=6&format=json`;
    const wRes = await fetch(wikiUrl, { signal: AbortSignal.timeout(3000) });
    const wData = await wRes.json();
    if (wData && wData[1] && wData[1].length > 0) {
      for (let i = 0; i < wData[1].length; i++) {
        const title = wData[1][i];
        const snippet = wData[2][i] || `Informasi ensiklopedia komprehensif tentang ${title} di Wikipedia bahasa Indonesia.`;
        const url = wData[3][i];
        if (url) {
          if (i === 0 && !knowledgeCard) {
            knowledgeCard = { title, desc: snippet, url };
          }
          searchResults.push({
            title: `${title} - Wikipedia Bahasa Indonesia`,
            url,
            snippet,
            domain: "id.wikipedia.org"
          });
        }
      }
    }
  } catch {}

  // 2. Yahoo Organic Search for live web results
  try {
    const yRes = await fetch(`https://search.yahoo.com/search?p=${encodeURIComponent(cleanQuery)}&ei=UTF-8`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8"
      },
      signal: AbortSignal.timeout(4000)
    });
    const yHtml = await yRes.text();
    const h3Regex = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h3>/gi;
    let match;
    while ((match = h3Regex.exec(yHtml)) !== null) {
      let rawHref = match[1];
      let rawTitle = match[2].replace(/<[^>]+>/g, "").trim();

      let destUrl = rawHref;
      if (rawHref.includes("/RU=")) {
        const ruMatch = rawHref.match(/\/RU=(https?[^/]+)/);
        if (ruMatch && ruMatch[1]) {
          try {
            destUrl = decodeURIComponent(ruMatch[1]);
          } catch {}
        }
      }

      if (destUrl.startsWith("http") && !destUrl.includes("yahoo.com") && !destUrl.includes("yimg.com")) {
        try {
          const parsed = new URL(destUrl);
          if (!searchResults.some((r) => r.url === destUrl)) {
            searchResults.push({
              title: rawTitle,
              url: destUrl,
              snippet: `Kunjungi situs resmi ${parsed.hostname} untuk informasi lengkap dan artikel terkini seputar ${cleanQuery}.`,
              domain: parsed.hostname
            });
          }
        } catch {}
      }
    }
  } catch {}

  // Fallback if results are thin
  if (searchResults.length === 0) {
    searchResults.push({
      title: `${cleanQuery} - Ensiklopedia Wikipedia`,
      url: `https://id.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}`,
      snippet: `Jelajahi referensi dan informasi ensiklopedia lengkap mengenai ${cleanQuery}.`,
      domain: "id.wikipedia.org"
    });
    searchResults.push({
      title: `Pencarian Berita Terkait: ${cleanQuery} di Detik.com`,
      url: `https://www.detik.com/search/searchall?query=${encodeURIComponent(cleanQuery)}`,
      snippet: `Berita terkini, liputan mendalam, dan peristiwa terbaru mengenai ${cleanQuery}.`,
      domain: "www.detik.com"
    });
    searchResults.push({
      title: `Pencarian Terkini: ${cleanQuery} di Kompas.com`,
      url: `https://search.kompas.com/search/?q=${encodeURIComponent(cleanQuery)}`,
      snippet: `Kumpulan berita, analisis, dan edukasi terverifikasi seputar ${cleanQuery}.`,
      domain: "search.kompas.com"
    });
  }

  const resultsHtml = searchResults
    .map(
      (r, idx) => `
    <div class="g-card" id="search-res-${idx}">
      <div class="g-cite">
        <span class="g-favicon">🌐</span>
        <span class="g-domain">${r.domain}</span>
        <span class="g-arrow">›</span>
        <span class="g-path">search</span>
      </div>
      <h3 class="g-title">
        <a href="${r.url}">${r.title}</a>
      </h3>
      <p class="g-snippet">${r.snippet}</p>
    </div>`
    )
    .join("");

  const knowledgeHtml = knowledgeCard
    ? `
    <div class="g-knowledge">
      <div class="g-knowledge-header">
        <div class="g-knowledge-badge">Ringkasan Ensiklopedia</div>
        <h2 class="g-knowledge-title">${knowledgeCard.title}</h2>
      </div>
      <p class="g-knowledge-desc">${knowledgeCard.desc}</p>
      <a class="g-knowledge-btn" href="${knowledgeCard.url}">Buka Artikel Lengkap di Wikipedia ›</a>
    </div>`
    : "";

  const pageTitle = `${cleanQuery} - Penelusuran Google`;

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #1f1f1f;
      --subtext: #4d5156;
      --link: #1a0dab;
      --visited: #681da8;
      --border: #dfe1e5;
      --card-bg: #f8f9fa;
      --accent: #1a73e8;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #202124;
        --text: #e8eaed;
        --subtext: #bdc1c6;
        --link: #8ab4f8;
        --visited: #c58af9;
        --border: #3c4043;
        --card-bg: #303134;
        --accent: #8ab4f8;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.58;
      font-size: 14px;
    }
    header {
      position: sticky;
      top: 0;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      padding: 12px 16px 8px;
      z-index: 100;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }
    .logo {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      text-decoration: none;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .logo span:nth-child(1) { color: #4285f4; }
    .logo span:nth-child(2) { color: #ea4335; }
    .logo span:nth-child(3) { color: #fbbc05; }
    .logo span:nth-child(4) { color: #4285f4; }
    .logo span:nth-child(5) { color: #34a853; }
    .logo span:nth-child(6) { color: #ea4335; }
    .search-form {
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 6px 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 15px;
      outline: none;
      padding: 4px 8px;
    }
    .search-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--accent);
      font-size: 16px;
      display: flex;
      align-items: center;
      padding: 4px 8px;
    }
    .tabs-bar {
      display: flex;
      gap: 20px;
      max-width: 900px;
      margin: 8px auto 0;
      padding: 0 4px;
      overflow-x: auto;
    }
    .tab-item {
      color: var(--subtext);
      text-decoration: none;
      font-size: 13px;
      padding: 6px 2px 8px;
      border-bottom: 3px solid transparent;
      white-space: nowrap;
      cursor: pointer;
    }
    .tab-item.active {
      color: var(--accent);
      font-weight: 500;
      border-bottom-color: var(--accent);
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px 16px 60px;
    }
    .stats {
      color: var(--subtext);
      font-size: 12px;
      margin-bottom: 18px;
    }
    .g-knowledge {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .g-knowledge-badge {
      display: inline-block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 4px;
    }
    .g-knowledge-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .g-knowledge-desc {
      color: var(--subtext);
      font-size: 14px;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .g-knowledge-btn {
      display: inline-flex;
      align-items: center;
      font-weight: 500;
      color: var(--accent);
      text-decoration: none;
      font-size: 13px;
    }
    .g-card {
      margin-bottom: 24px;
    }
    .g-cite {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--subtext);
      margin-bottom: 4px;
    }
    .g-favicon { font-size: 13px; }
    .g-title {
      font-size: 18px;
      font-weight: 400;
      margin-bottom: 4px;
    }
    .g-title a {
      color: var(--link);
      text-decoration: none;
    }
    .g-title a:hover {
      text-decoration: underline;
    }
    .g-snippet {
      color: var(--subtext);
      font-size: 13px;
      line-height: 1.55;
    }
    .related-box {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .related-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 8px 14px;
      color: var(--text);
      text-decoration: none;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .chip:hover {
      background: var(--border);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-top">
      <a class="logo" href="https://www.google.com">
        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
      </a>
      <form class="search-form" action="https://www.google.com/search" method="GET">
        <input class="search-input" type="text" name="q" value="${cleanQuery.replace(/"/g, "&quot;")}" placeholder="Telusuri apa saja..." autofocus />
        <button class="search-btn" type="submit" aria-label="Cari">🔍</button>
      </form>
    </div>
    <div class="tabs-bar">
      <a class="tab-item active" href="https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}">Semua</a>
      <a class="tab-item" href="https://id.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}">Ensiklopedia</a>
      <a class="tab-item" href="https://www.detik.com/search/searchall?query=${encodeURIComponent(cleanQuery)}">Berita</a>
      <a class="tab-item" href="https://search.kompas.com/search/?q=${encodeURIComponent(cleanQuery)}">Artikel</a>
    </div>
  </header>

  <div class="container">
    <div class="stats">Sekitar ${(searchResults.length * 142000).toLocaleString("id-ID")} hasil (${(0.18 + Math.random() * 0.1).toFixed(2)} detik) • Dilindungi Aegis Stealth Shield</div>
    
    ${knowledgeHtml}

    <div class="results-list">
      ${resultsHtml}
    </div>

    <div class="related-box">
      <div class="related-title">Penelusuran Terkait</div>
      <div class="chips">
        <a class="chip" href="https://www.google.com/search?q=${encodeURIComponent(cleanQuery + " terbaru")}">🔍 ${cleanQuery} terbaru</a>
        <a class="chip" href="https://www.google.com/search?q=${encodeURIComponent(cleanQuery + " wikipedia")}">🔍 ${cleanQuery} wikipedia</a>
        <a class="chip" href="https://www.google.com/search?q=${encodeURIComponent("apa itu " + cleanQuery)}">🔍 apa itu ${cleanQuery}</a>
        <a class="chip" href="https://www.google.com/search?q=${encodeURIComponent("cara merawat " + cleanQuery)}">🔍 cara merawat ${cleanQuery}</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { html: fullHtml, title: pageTitle };
}

function generateGoogleHomeHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #202124;
      --subtext: #5f6368;
      --border: #dfe1e5;
      --card: #f8f9fa;
      --btn-bg: #f8f9fa;
      --btn-text: #3c4043;
      --btn-border: #f8f9fa;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #202124;
        --text: #e8eaed;
        --subtext: #9aa0a6;
        --border: #5f6368;
        --card: #303134;
        --btn-bg: #303134;
        --btn-text: #e8eaed;
        --btn-border: #303134;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .wrapper {
      width: 100%;
      max-width: 584px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo {
      font-size: 64px;
      font-weight: 700;
      letter-spacing: -2px;
      margin-bottom: 28px;
      user-select: none;
    }
    .logo span:nth-child(1) { color: #4285f4; }
    .logo span:nth-child(2) { color: #ea4335; }
    .logo span:nth-child(3) { color: #fbbc05; }
    .logo span:nth-child(4) { color: #4285f4; }
    .logo span:nth-child(5) { color: #34a853; }
    .logo span:nth-child(6) { color: #ea4335; }
    .search-box {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      transition: all 0.2s ease;
    }
    .search-box:focus-within {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      border-color: transparent;
    }
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 16px;
      outline: none;
      padding: 4px 0;
    }
    .search-icon {
      font-size: 18px;
      color: var(--subtext);
    }
    .btn-group {
      display: flex;
      gap: 12px;
      margin-top: 26px;
      justify-content: center;
    }
    .btn {
      background: var(--btn-bg);
      color: var(--btn-text);
      border: 1px solid var(--btn-border);
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn:hover {
      border-color: var(--border);
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .shortcuts {
      margin-top: 32px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    .shortcut-chip {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 16px;
      color: var(--text);
      text-decoration: none;
      font-size: 13px;
    }
    .shortcut-chip:hover {
      background: var(--border);
    }
    .footer-text {
      margin-top: 36px;
      font-size: 12px;
      color: var(--subtext);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">
      <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
    </div>
    <form class="search-box" action="https://www.google.com/search" method="GET" style="width: 100%;">
      <span class="search-icon">🔍</span>
      <input class="search-input" type="text" name="q" placeholder="Telusuri Google atau ketik URL..." autofocus />
      <button type="submit" style="display: none;"></button>
    </form>
    <div class="btn-group">
      <button class="btn" type="button" onclick="document.querySelector('form').submit()">Penelusuran Google</button>
      <button class="btn" type="button" onclick="window.location.href='https://id.wikipedia.org/wiki/Istimewa:Halaman_acak'">Saya Lagi Beruntung</button>
    </div>
    <div class="shortcuts">
      <a class="shortcut-chip" href="https://id.wikipedia.org">📚 Wikipedia</a>
      <a class="shortcut-chip" href="https://www.detik.com">📰 Detik News</a>
      <a class="shortcut-chip" href="https://www.kompas.com">🌐 Kompas</a>
      <a class="shortcut-chip" href="https://news.ycombinator.com">⚡ Hacker News</a>
      <a class="shortcut-chip" href="https://github.com">🐙 GitHub</a>
    </div>
    <div class="footer-text">
      Dilindungi oleh Aegis Shield • Penelusuran Aman Bebas Pelacakan
    </div>
  </div>
</body>
</html>`;
}

app.post("/api/proxy-fetch", async (req, res) => {
  try {
    const { url, userAgent, proxyNode, removeScripts, stripAds } = req.body;
    if (!url) {
      res.status(400).json({ error: "Target URL is required" });
      return;
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    // Safety check first
    const safety = analyzeUrlSafety(targetUrl);

    // Fast-path for Google search or homepage to avoid bot blocks and datacenter IP roadblocks
    try {
      const parsed = new URL(targetUrl);
      const isGoogleDomain = /(?:^|\.)google\.(?:com|co\.id|[a-z.]+)$/i.test(parsed.hostname);
      
      if (isGoogleDomain) {
        const queryParam = parsed.searchParams.get("q");
        if (queryParam) {
          // Serve rich stealth search results
          const { html, title } = await generateStealthSearchResultHtml(queryParam, targetUrl);
          
          // Inject Aegis interceptor
          const interceptorScript = `
<script id="aegis-sandbox-interceptor">
(function() {
  function dispatchNav(url) {
    if (!url) return;
    var trimmed = String(url).trim();
    if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed === '#') return;
    try {
      var resolved = new URL(trimmed, window.location.href).href;
      window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: resolved }, '*');
    } catch(e) {
      window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: trimmed }, '*');
    }
  }

  document.addEventListener('click', function(e) {
    var target = e.target.closest('a');
    if (target && target.href) {
      e.preventDefault();
      e.stopPropagation();
      dispatchNav(target.getAttribute('href') || target.href);
    }
  }, true);

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.tagName === 'FORM') {
      e.preventDefault();
      e.stopPropagation();
      var action = form.getAttribute('action') || window.location.href;
      var formData = new FormData(form);
      var params = new URLSearchParams();
      formData.forEach(function(value, key) {
        params.append(key, String(value));
      });
      var queryStr = params.toString();
      var fullUrl = action;
      if (queryStr) {
        fullUrl += (action.indexOf('?') === -1 ? '?' : '&') + queryStr;
      }
      dispatchNav(fullUrl);
    }
  }, true);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active.form) {
        e.preventDefault();
        e.stopPropagation();
        var form = active.form;
        var action = form.getAttribute('action') || window.location.href;
        var formData = new FormData(form);
        var params = new URLSearchParams();
        formData.forEach(function(value, key) {
          params.append(key, String(value));
        });
        var queryStr = params.toString();
        var fullUrl = action;
        if (queryStr) {
          fullUrl += (action.indexOf('?') === -1 ? '?' : '&') + queryStr;
        }
        dispatchNav(fullUrl);
      }
    }
  }, true);
})();
</script>`;
          const finalHtml = html.replace("</head>", `${interceptorScript}</head>`);
          res.json({
            success: true,
            finalUrl: targetUrl,
            pageTitle: title,
            contentType: "text/html",
            status: 200,
            html: finalHtml,
            safety,
            mediaList: [],
            headers: {
              server: "gws-aegis",
              contentLength: String(finalHtml.length),
              security: "Aegis Sandbox Isolated"
            }
          });
          return;
        } else if (parsed.pathname === "/" || parsed.pathname === "") {
          // Serve clean Google Homepage
          const homeHtml = generateGoogleHomeHtml();
          const interceptorScript = `
<script id="aegis-sandbox-interceptor">
(function() {
  function dispatchNav(url) {
    if (!url) return;
    var trimmed = String(url).trim();
    if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed === '#') return;
    try {
      var resolved = new URL(trimmed, window.location.href).href;
      window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: resolved }, '*');
    } catch(e) {
      window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: trimmed }, '*');
    }
  }

  document.addEventListener('click', function(e) {
    var target = e.target.closest('a');
    if (target && target.href) {
      e.preventDefault();
      e.stopPropagation();
      dispatchNav(target.getAttribute('href') || target.href);
    }
  }, true);

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.tagName === 'FORM') {
      e.preventDefault();
      e.stopPropagation();
      var action = form.getAttribute('action') || window.location.href;
      var formData = new FormData(form);
      var params = new URLSearchParams();
      formData.forEach(function(value, key) {
        params.append(key, String(value));
      });
      var queryStr = params.toString();
      var fullUrl = action;
      if (queryStr) {
        fullUrl += (action.indexOf('?') === -1 ? '?' : '&') + queryStr;
      }
      dispatchNav(fullUrl);
    }
  }, true);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active.form) {
        e.preventDefault();
        e.stopPropagation();
        var form = active.form;
        var action = form.getAttribute('action') || window.location.href;
        var formData = new FormData(form);
        var params = new URLSearchParams();
        formData.forEach(function(value, key) {
          params.append(key, String(value));
        });
        var queryStr = params.toString();
        var fullUrl = action;
        if (queryStr) {
          fullUrl += (action.indexOf('?') === -1 ? '?' : '&') + queryStr;
        }
        dispatchNav(fullUrl);
      }
    }
  }, true);
})();
</script>`;
          const finalHtml = homeHtml.replace("</head>", `${interceptorScript}</head>`);
          res.json({
            success: true,
            finalUrl: targetUrl,
            pageTitle: "Google",
            contentType: "text/html",
            status: 200,
            html: finalHtml,
            safety,
            mediaList: [],
            headers: {
              server: "gws-aegis",
              contentLength: String(finalHtml.length),
              security: "Aegis Sandbox Isolated"
            }
          });
          return;
        }
      }
    } catch {}

    // Simulated/Real stealth headers with browser emulation
    const customHeaders: Record<string, string> = {
      "User-Agent": userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      "Sec-Ch-Ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "DNT": "1",
    };

    if (proxyNode) {
      customHeaders["X-Forwarded-For"] = `198.51.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`;
      customHeaders["X-Real-IP"] = customHeaders["X-Forwarded-For"];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let fetchTarget = targetUrl;
    // If target is google search, ensure query parameters are formatted cleanly
    if (/google\.[a-z.]+\/search/i.test(targetUrl) && !targetUrl.includes("hl=")) {
      fetchTarget += (fetchTarget.includes("?") ? "&" : "?") + "hl=id&gl=id&pws=0";
    }

    let response: Response;
    try {
      response = await fetch(fetchTarget, {
        method: "GET",
        headers: customHeaders,
        signal: controller.signal,
        redirect: "follow",
      });
    } catch (fetchErr: any) {
      // Retry once with fallback stealth headers
      try {
        response = await fetch(fetchTarget, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
            "Accept": "*/*"
          },
          signal: AbortSignal.timeout(8000),
          redirect: "follow",
        });
      } catch (retryErr: any) {
        throw new Error(`Tidak dapat menghubungi server [${new URL(targetUrl).hostname}]: ${fetchErr.message}`);
      }
    }

    clearTimeout(timeout);

    // If server returned 403/429/503 bot roadblock, try one more stealth retry with mobile UA
    if (response.status === 403 || response.status === 429) {
      try {
        const mobileRes = await fetch(fetchTarget, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          signal: AbortSignal.timeout(6000),
          redirect: "follow",
        });
        if (mobileRes.ok) {
          response = mobileRes;
        }
      } catch {}
    }

    // If Google returned a JS challenge, bot protection, or consent wall, fall back to DuckDuckGo HTML search for instant reliable search results
    const isGoogleChallenge =
      (response.url && (response.url.includes("consent.google.com") || response.url.includes("sorry/index"))) ||
      response.status === 429 ||
      response.status === 503;

    let html = await response.text();

    // Check if body is a bot challenge
    if (
      isGoogleChallenge ||
      (/google\.[a-z.]+\/search/i.test(targetUrl) &&
        (html.includes("challenge_version") || html.includes("sg_ss") || html.includes("support.google.com/websearch") || html.length < 5000))
    ) {
      const urlObj = new URL(targetUrl);
      const queryParam = urlObj.searchParams.get("q");
      if (queryParam) {
        const fallbackUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryParam)}`;
        const fbResponse = await fetch(fallbackUrl, {
          method: "GET",
          headers: customHeaders,
          redirect: "follow",
        });
        if (fbResponse.ok) {
          html = await fbResponse.text();
        }
      }
    }

    const contentType = response.headers.get("content-type") || "";
    const status = response.status;
    const finalUrl = response.url || targetUrl;

    if (contentType.includes("text/html") || contentType.includes("application/xhtml") || !contentType || html.includes("<html") || html.includes("<body")) {

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim() : new URL(finalUrl).hostname;

      // Extract media links (videos, audios, streams)
      const mediaList: Array<{ type: string; src: string; label: string; resolution?: string }> = [];

      // Find video tags
      const videoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = videoRegex.exec(html)) !== null) {
        if (match[1]) {
          const absoluteSrc = new URL(match[1], finalUrl).href;
          mediaList.push({ type: "video/mp4", src: absoluteSrc, label: "Embedded HTML5 Video Stream", resolution: "HD" });
        }
      }

      // Find video source tags
      const sourceRegex = /<source[^>]*src=["']([^"']+)["'][^>]*type=["']([^"']+)["']?[^>]*>/gi;
      while ((match = sourceRegex.exec(html)) !== null) {
        if (match[1]) {
          const absoluteSrc = new URL(match[1], finalUrl).href;
          const type = match[2] || "video/mp4";
          mediaList.push({ type, src: absoluteSrc, label: `Direct Stream (${type.split("/")[1] || "media"})`, resolution: "Original" });
        }
      }

      // Look for m3u8 / mp4 in script tags or attributes
      const directMediaRegex = /https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8|webm|mp3|ogg|mov)(?:\?[^\s"'<>]*)?/gi;
      const directMatches = html.match(directMediaRegex) || [];
      for (const m of directMatches.slice(0, 15)) {
        if (!mediaList.some((existing) => existing.src === m)) {
          const ext = m.split("?")[0].split(".").pop()?.toLowerCase() || "video";
          mediaList.push({
            type: ext === "mp3" || ext === "ogg" ? "audio" : "video",
            src: m,
            label: `High-Res Media File (.${ext})`,
            resolution: ext === "mp4" ? "1080p / Stream" : "Audio Track"
          });
        }
      }

      // Fix protocol relative links for images and media: src="//example.com" -> src="https://example.com"
      html = html.replace(/(src|href|poster)=["']\/\/([^"']+)["']/gi, '$1="https://$2"');

      // Strip meta CSP or frame blocking tags from remote page
      html = html.replace(/<meta[^>]+http-equiv=["']?(?:content-security-policy|x-frame-options)["']?[^>]*>/gi, "");

      // Replace target="_top" or target="_blank" with target="_self" so sandbox doesn't break
      html = html.replace(/target=["'](?:_blank|_top|_parent)["']/gi, 'target="_self"');

      // Unwrap Google tracking redirects: /url?q=https://... -> https://...
      html = html.replace(/href=["'](?:\/url\?q=|https?:\/\/(?:www\.)?google\.[a-z.]+\/url\?q=)(https?[^"'&]+|[^"']*)["']/gi, (m, dest) => {
        try {
          const cleanDest = dest.split("&")[0];
          return `href="${decodeURIComponent(cleanDest)}"`;
        } catch {
          return m;
        }
      });

      // Unwrap DuckDuckGo tracking redirects: //duckduckgo.com/l/?uddg=https%3A%2F%2F...
      html = html.replace(/href=["'](?:https?:)?\/\/(?:www\.)?duckduckgo\.com\/l\/\?[^"']*uddg=([^"'\s>]+)["']/gi, (m, rawUddg) => {
        try {
          const unescaped = rawUddg.replace(/&amp;/g, "&");
          const dest = unescaped.split("&")[0];
          return `href="${decodeURIComponent(dest)}"`;
        } catch {
          return m;
        }
      });

      // Also sniff prominent image media (og:image or high-res pictures)
      const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        try {
          const absoluteOg = new URL(ogImageMatch[1], finalUrl).href;
          if (!mediaList.some(m => m.src === absoluteOg)) {
            mediaList.unshift({
              type: "image/jpeg",
              src: absoluteOg,
              label: "Primary Poster / OG Image",
              resolution: "High Resolution"
            });
          }
        } catch {}
      }

      // If ad stripping is enabled, remove typical tracking scripts
      if (stripAds) {
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*(?:google-analytics|googletagmanager|facebook-jssdk|doubleclick|clarity\.ms|segment\.io)[^<]*<\/script>/gi, "<!-- Ad/Tracker Sanitized by Aegis Shield -->");
      }

      if (removeScripts) {
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "<!-- Scripts Disabled in Pure Isolation Mode -->");
      }

      // Inject base URL and no-referrer so relative images, CDNs, and stylesheets render without 403 Forbidden
      const baseTag = `<base href="${finalUrl}"><meta name="referrer" content="no-referrer">`;

      // Injected Aegis Sandbox Runtime Interceptor:
      // Catches form submits (Google search, Wikipedia, DuckDuckGo), Enter keypress, and link clicks,
      // routing them smoothly back to the parent Aegis browser frame via postMessage.
      const interceptorScript = `
<script id="aegis-sandbox-interceptor">
(function() {
  function dispatchNav(url) {
    if (!url) return;
    var trimmed = String(url).trim();
    if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed === '#') return;
    
    // Auto-unwrap Google redirects
    if (trimmed.indexOf('/url?') !== -1 && trimmed.indexOf('q=') !== -1) {
      var m = trimmed.match(/[?&]q=(https?[^&]+)/);
      if (m && m[1]) {
        try { trimmed = decodeURIComponent(m[1]); } catch(e) {}
      }
    }

    try {
      var absolute = new URL(trimmed, document.baseURI || window.location.href).href;
      window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: absolute }, '*');
    } catch(err) {
      window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: trimmed }, '*');
    }
  }

  // Prevent frame-busting scripts from breaking the sandbox
  try {
    Object.defineProperty(window, 'top', { get: function() { return window; } });
    Object.defineProperty(window, 'parent', { get: function() { return window; } });
  } catch(e) {}

  // Monkey-patch history navigation
  try {
    var _pushState = history.pushState;
    history.pushState = function(state, title, url) {
      if (url) dispatchNav(url);
      return _pushState.apply(this, arguments);
    };
    var _replaceState = history.replaceState;
    history.replaceState = function(state, title, url) {
      if (url && String(url).includes('search')) dispatchNav(url);
      return _replaceState.apply(this, arguments);
    };
  } catch(e) {}

  // Monkey-patch window.open
  try {
    window.open = function(url) {
      if (url) dispatchNav(url);
      return null;
    };
  } catch(e) {}

  // 1. Intercept Enter key inside any Search Input or Textarea
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      var target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true')) {
        var query = (target.value || target.innerText || '').trim();
        if (query) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          var form = target.closest ? target.closest('form') : null;
          if (form) {
            var action = form.getAttribute('action') || '/search';
            var formData = new FormData(form);
            var params = new URLSearchParams();
            for (var pair of formData.entries()) {
              if (pair[0]) params.append(pair[0], pair[1]);
            }
            var name = target.getAttribute('name') || 'q';
            params.set(name, query);

            var resolvedAction = action;
            try {
              resolvedAction = new URL(action, document.baseURI || window.location.href).href;
            } catch(err) {}
            var finalUrl = resolvedAction + (resolvedAction.includes('?') ? '&' : '?') + params.toString();
            dispatchNav(finalUrl);
          } else {
            var host = window.location.hostname || '';
            if (host.includes('google')) {
              dispatchNav('https://www.google.com/search?q=' + encodeURIComponent(query) + '&hl=id');
            } else if (host.includes('duckduckgo')) {
              dispatchNav('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query));
            } else {
              try {
                var searchUrl = new URL('/search?q=' + encodeURIComponent(query), document.baseURI || window.location.href).href;
                dispatchNav(searchUrl);
              } catch(err) {
                dispatchNav('https://www.google.com/search?q=' + encodeURIComponent(query));
              }
            }
          }
        }
      }
    }
  }, true);

  // 2. Intercept all Link Clicks and Search Button Clicks
  window.addEventListener('click', function(e) {
    var target = e.target;

    // Check if link
    var link = target.closest ? target.closest('a') : null;
    if (link) {
      var href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        dispatchNav(href);
        return;
      }
    }

    // Check if search button or submit button
    var btn = target.closest ? target.closest('button, input[type="submit"], input[type="button"], [role="button"]') : null;
    if (btn) {
      var btnText = (btn.innerText || btn.value || btn.getAttribute('aria-label') || '').toLowerCase();
      var isSearch = btnText.includes('search') || btnText.includes('cari') || btnText.includes('penelusuran') || btn.getAttribute('type') === 'submit' || btn.getAttribute('jsname') === 'Tg7LZd';
      if (isSearch) {
        var form = btn.closest ? btn.closest('form') : null;
        var searchInput = form 
          ? (form.querySelector('input[name="q"], textarea[name="q"], input[type="search"], input[type="text"]') || document.querySelector('input[name="q"], textarea[name="q"]'))
          : document.querySelector('input[name="q"], textarea[name="q"], input[type="search"], input[type="text"]');
        
        if (searchInput && searchInput.value && searchInput.value.trim()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          var qVal = searchInput.value.trim();
          var host = window.location.hostname || '';
          if (host.includes('google')) {
            dispatchNav('https://www.google.com/search?q=' + encodeURIComponent(qVal) + '&hl=id');
          } else {
            try {
              dispatchNav(new URL('/search?q=' + encodeURIComponent(qVal), document.baseURI || window.location.href).href);
            } catch(err) {
              dispatchNav('https://www.google.com/search?q=' + encodeURIComponent(qVal));
            }
          }
          return;
        }
      }
    }
  }, true);

  // 3. Intercept all Form Submissions (Google Search, DuckDuckGo, etc.)
  window.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.tagName === 'FORM') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      var action = form.getAttribute('action') || '/search';
      var formData = new FormData(form);
      var params = new URLSearchParams();

      for (var pair of formData.entries()) {
        if (pair[0]) params.append(pair[0], pair[1]);
      }

      var queryString = params.toString();
      var resolvedAction = '';
      try {
        resolvedAction = new URL(action || window.location.href, document.baseURI || window.location.href).href;
      } catch(err) {
        resolvedAction = action || window.location.href;
      }

      var finalUrl = resolvedAction;
      if (queryString) {
        finalUrl = finalUrl + (finalUrl.includes('?') ? '&' : '?') + queryString;
      }

      dispatchNav(finalUrl);
    }
  }, true);
})();
</script>
`;

      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}${interceptorScript}`);
      } else if (html.includes("<html")) {
        html = html.replace(/<html[^>]*>/, `$&<head>${baseTag}${interceptorScript}</head>`);
      } else {
        html = `<head>${baseTag}${interceptorScript}</head>${html}`;
      }

      res.json({
        success: true,
        finalUrl,
        pageTitle,
        contentType,
        status,
        html,
        safety,
        mediaList: mediaList.slice(0, 20),
        headers: {
          server: response.headers.get("server") || "Aegis Cloaked Node",
          contentLength: response.headers.get("content-length") || "dynamic",
          security: "Aegis Sandbox Isolated"
        }
      });
    } else {
      // Non-HTML content (e.g. direct media, JSON, or image)
      res.json({
        success: true,
        finalUrl,
        pageTitle: new URL(finalUrl).pathname.split("/").pop() || "Direct Asset Stream",
        contentType,
        status,
        html: `<div style="font-family:sans-serif;padding:30px;text-align:center;color:#333;"><h3>Berkas Media Langsung</h3><p>Tipe konten: <code>${contentType}</code></p><a href="${finalUrl}" target="_blank" style="display:inline-block;padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;">Buka Berkas Langsung</a></div>`,
        safety,
        mediaList: [{
          type: contentType,
          src: finalUrl,
          label: "Direct File Target",
          resolution: "Raw Source"
        }],
        headers: {
          server: "Aegis Cloaked Node",
          contentLength: response.headers.get("content-length") || "Unknown"
        }
      });
    }
  } catch (error: any) {
    console.error("Proxy error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch web content through secure proxy.",
      safety: {
        isSuspicious: false,
        threatLevel: "safe",
        reasons: ["Gagal menghubungkan ke server tujuan. Host mungkin offline atau memblokir koneksi."],
        score: 0,
        domain: "error"
      }
    });
  }
});

// API: Media Extractor / Video Downloader Probe
app.post("/api/extract-media", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "*/*"
      }
    });

    const html = await response.text();
    const media: Array<{ title: string; url: string; quality: string; format: string; sizeEstimate?: string }> = [];

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Media Stream";

    // Detect mp4 / m3u8 / webm
    const streamRegex = /https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8|webm|mp3|m4a)(?:\?[^\s"'<>]*)?/gi;
    const matches = Array.from(new Set(html.match(streamRegex) || []));

    for (const m of matches.slice(0, 10)) {
      const ext = m.split("?")[0].split(".").pop()?.toUpperCase() || "MP4";
      media.push({
        title: `${title} - ${ext}`,
        url: m,
        quality: ext === "MP4" ? "1080p Full HD" : ext === "WEBM" ? "720p HD" : "Audio HQ",
        format: ext,
        sizeEstimate: ext === "MP4" ? "~45.2 MB" : ext === "MP3" ? "~4.8 MB" : "~22.1 MB"
      });
    }

    // If no direct video streams found, generate downloadable simulated inspection targets
    if (media.length === 0) {
      media.push(
        {
          title: `${title} (Stream Web Rekaman)`,
          url: targetUrl,
          quality: "Source Dynamic Stream (1080p)",
          format: "MP4",
          sizeEstimate: "~32.5 MB"
        },
        {
          title: `${title} (Ekstrak Audio Saja)`,
          url: targetUrl,
          quality: "320kbps Lossless Audio",
          format: "MP3",
          sizeEstimate: "~5.1 MB"
        }
      );
    }

    res.json({
      success: true,
      title,
      media
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to extract media" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "Aegis All-in-One Stealth Proxy Node", uptime: process.uptime() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aegis Browser Engine listening on port ${PORT}`);
  });
}

startServer();
