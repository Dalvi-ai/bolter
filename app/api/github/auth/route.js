import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`;
  const scope = 'repo workflow';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
} 