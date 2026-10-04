import socket
import ipaddress
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup

def is_private_or_restricted_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip_str == "169.254.169.254"
        )
    except ValueError:
        return True

async def fetch_article_safely(url_str: str) -> dict:
    parsed = urlparse(url_str)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Forbidden protocol: {parsed.scheme}. Only HTTP/HTTPS allowed.")

    hostname = parsed.hostname
    if not hostname or hostname in ("localhost", "127.0.0.1", "0.0.0.0"):
        raise ValueError("Access to loopback hosts is forbidden.")

    # DNS check to block private subnets (SSRF defense)
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            if is_private_or_restricted_ip(ip_str):
                raise PermissionError(f"Security Alert: Domain resolves to protected IP ({ip_str}). Blocked by SSRF filter.")
    except socket.gaierror:
        raise ValueError(f"Could not resolve host: {hostname}")

    async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
        resp = await client.get(
            url_str,
            headers={"User-Agent": "Mozilla/5.0 TruthLens-Bot/1.0"}
        )
        resp.raise_for_status()

        html = resp.text[:2_000_000] # max 2MB
        soup = BeautifulSoup(html, "html.parser")

        # Strip ads, scripts, nav, headers
        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "noscript"]):
            tag.decompose()

        title = ""
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"]
        elif soup.title:
            title = soup.title.string or ""

        text = soup.get_text(separator=" ", strip=True)

        return {
            "url": url_str,
            "domain": hostname,
            "title": title or "Extracted News Document",
            "content": text[:5000]
        }
