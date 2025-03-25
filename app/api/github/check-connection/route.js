import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const githubToken = cookies().get('github_token')?.value;

  if (!githubToken) {
    return NextResponse.json({ connected: false });
  }

  try {
    // Verify the token is valid by making a request to GitHub's API
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ connected: true });
    } else {
      // Token is invalid or expired
      cookies().delete('github_token');
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error('GitHub connection check error:', error);
    return NextResponse.json({ connected: false });
  }
} 