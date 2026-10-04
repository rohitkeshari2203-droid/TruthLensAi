import dns from 'dns/promises';
import { URL } from 'url';

export interface ScrapedArticle {
  url: string;
  domain: string;
  title: string;
  author?: string;
  publication_date?: string;
  publisher?: string;
  content: string;
}

// Check if IP address is internal/private (SSRF protection)
export function isPrivateOrReservedIP(ip: string): boolean {
  // IPv4 checks
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '0.0.0.0') return true;
  if (ip.startsWith('10.')) return true; // 10.0.0.0/8
  if (ip.startsWith('192.168.')) return true; // 192.168.0.0/16
  if (ip.startsWith('169.254.')) return true; // Link-local / Cloud metadata (AWS, GCP, Azure 169.254.169.254)
  if (ip.startsWith('127.')) return true; // Loopback 127.0.0.0/8

  // 172.16.0.0 - 172.31.255.255
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // Carrier-grade NAT
  }

  // IPv6 loopback / link-local / private
  if (ip === '::1' || ip === '::' || ip.toLowerCase().startsWith('fe80:') || ip.toLowerCase().startsWith('fc00:') || ip.toLowerCase().startsWith('fd00:')) {
    return true;
  }

  return false;
}

// Clean HTML tags and strip script/style/nav/header/footer/ads
export function extractCleanArticleText(html: string): { title: string; content: string; author?: string; pubDate?: string } {
  // Extract Title
  let title = '';
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    title = ogTitleMatch[1];
  } else {
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch) title = titleTagMatch[1].trim();
  }

  // Extract Author
  let author: string | undefined;
  const authorMatch = html.match(/<meta\s+(?:name|property)=["'](?:author|article:author)["']\s+content=["']([^"']+)["']/i);
  if (authorMatch) author = authorMatch[1];

  // Extract Pub Date
  let pubDate: string | undefined;
  const dateMatch = html.match(/<meta\s+(?:property|name)=["'](?:article:published_time|date|pubdate)["']\s+content=["']([^"']+)["']/i);
  if (dateMatch) pubDate = dateMatch[1];

  // Strip script, style, svg, noscript, nav, header, footer, aside, ads
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ');

  // Strip all other HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Collapse whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // If text is very long, limit to first 5000 characters for analysis
  if (cleaned.length > 5000) {
    cleaned = cleaned.slice(0, 5000) + '...';
  }

  return {
    title: title || 'Extracted Article',
    content: cleaned,
    author,
    pubDate,
  };
}

export async function safelyFetchArticle(rawUrl: string): Promise<ScrapedArticle> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format. Please provide a full http:// or https:// URL.');
  }

  // Only allow http and https protocols
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`Forbidden protocol: ${parsedUrl.protocol}. Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block localhost aliases
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    throw new Error('Access to local host addresses is strictly forbidden.');
  }

  // Resolve DNS to verify IP addresses against SSRF
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateOrReservedIP(record.address)) {
        throw new Error(`Security Exception: Target domain resolves to a private or reserved network IP address (${record.address}). Request blocked by SSRF defense.`);
      }
    }
  } catch (dnsErr: any) {
    if (dnsErr.message && dnsErr.message.includes('SSRF defense')) {
      throw dnsErr;
    }
    throw new Error(`Unable to resolve domain name "${hostname}". Please check if the URL is accessible.`);
  }

  // Fetch with strict timeout and response size limit
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TruthLens-Verification-Bot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: HTTP status ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Unsupported content type: "${contentType}". TruthLens can only verify web articles and text pages.`);
    }

    // Limit download size to 3MB
    const text = await response.text();
    if (text.length > 3 * 1024 * 1024) {
      throw new Error('Target document exceeds the maximum 3MB size limit.');
    }

    const { title, content, author, pubDate } = extractCleanArticleText(text);

    if (!content || content.length < 50) {
      throw new Error('Extracted document text is too short or protected behind an impenetrable paywall/client-only script.');
    }

    return {
      url: parsedUrl.toString(),
      domain: hostname,
      title,
      author,
      publication_date: pubDate,
      publisher: hostname,
      content,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('The target website took longer than 9 seconds to respond and timed out.');
    }
    throw err;
  }
}
