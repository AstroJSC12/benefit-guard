import { articles } from "@/lib/blog";

const BASE_URL = "https://benefit-guard.jeffcoy.net";

export function GET() {
  const items = articles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/blog/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${article.slug}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <category>${article.category}</category>
    </item>`
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BenefitGuard Blog — Health Insurance Guides</title>
    <link>${BASE_URL}/blog</link>
    <description>Free guides on appealing denied claims, reading your EOB, checking medical bills, and understanding your health insurance rights.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
