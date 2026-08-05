import { NextResponse } from 'next/server';
import { Post } from '@/app/lib/sequelize';

// Escapes special XML characters so content doesn't break the XML structure
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await Post.findAll({
    where: { status: 'published' },
    order: [['createdAt', 'DESC']],
  });

  const items = posts
    .map((post) => {
      const p = post.toJSON() as any;
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(p.link || 'http://localhost:3000')}</link>
      <description>${escapeXml(p.summary)}</description>
      <author>${escapeXml(p.author)}</author>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <guid>${p.id}</guid>
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Server Feed</title>
    <link>http://localhost:3000</link>
    <description>RSS feed for the LMS project</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}