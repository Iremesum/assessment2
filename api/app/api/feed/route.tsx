import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/app/lib/sequelize';
import { incrementRequestCount } from '@/app/lib/sequelize';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS – CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET – Get all posts or one by ID (?id=1)
export async function GET(request: NextRequest) {
  try {
    incrementRequestCount();
    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const post = await Post.findByPk(parseInt(id));
      if (!post) {
        return new NextResponse('Post not found', { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(post, { headers: corsHeaders });
    }

    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json(posts, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Server error', { status: 500, headers: corsHeaders });
  }
}

// POST – Create new post
export async function POST(request: NextRequest) {
  try {
    const { title, author, content, summary, imageUrl, link, status } = await request.json();

    if (!title || !author || !content || !summary) {
      return new NextResponse('Missing required fields', { status: 400, headers: corsHeaders });
    }

    const newPost = await Post.create({
      title,
      author,
      content,
      summary,
      imageUrl: imageUrl || null,
      link: link || null,
      status: status || 'published',
    });
    return NextResponse.json(newPost, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request body', { status: 400, headers: corsHeaders });
  }
}

// PATCH – Update post by ID (?id=1)
export async function PATCH(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return new NextResponse('Missing id', { status: 400, headers: corsHeaders });
    }

    const post = await Post.findByPk(parseInt(id));
    if (!post) {
      return new NextResponse('Post not found', { status: 404, headers: corsHeaders });
    }

    const { title, author, content, summary, imageUrl, link, status } = await request.json();
    if (title !== undefined) post.title = title;
    if (author !== undefined) post.author = author;
    if (content !== undefined) post.content = content;
    if (summary !== undefined) post.summary = summary;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (link !== undefined) post.link = link;
    if (status !== undefined) post.status = status;

    await post.save();
    return NextResponse.json(post, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}

// DELETE – Delete post by ID (?id=1)
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return new NextResponse('Missing id', { status: 400, headers: corsHeaders });
    }

    const post = await Post.findByPk(parseInt(id));
    if (!post) {
      return new NextResponse('Post not found', { status: 404, headers: corsHeaders });
    }

    await post.destroy();
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}