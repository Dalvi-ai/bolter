import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/?error=github_auth_failed');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // Store the access token in a secure HTTP-only cookie
      cookies().set('github_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return NextResponse.redirect('/?success=github_connected');
    } else {
      throw new Error('Failed to get access token');
    }
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect('/?error=github_auth_failed');
  }
} 