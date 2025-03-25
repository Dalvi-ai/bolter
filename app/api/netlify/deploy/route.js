import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(req) {
  try {
    const { files, netlifyToken } = await req.json();

    if (!netlifyToken) {
      return NextResponse.json(
        { error: 'Netlify token is required' },
        { status: 401 }
      );
    }

    // Create a new site directly using the user's Netlify token
    const netlifyResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${netlifyToken}`,
      },
      body: JSON.stringify({
        site: {
          name: `bolt-app-${Date.now()}`,
          deploy_url: `bolt-app-${Date.now()}.netlify.app`,
        },
      }),
    });

    const netlifyData = await netlifyResponse.json();

    if (!netlifyData.id) {
      throw new Error('Failed to create Netlify site');
    }

    // Upload files to Netlify
    for (const [path, content] of Object.entries(files)) {
      await fetch(`https://api.netlify.com/api/v1/sites/${netlifyData.id}/files/${path}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${netlifyToken}`,
        },
        body: JSON.stringify({
          content: content.code,
        }),
      });
    }

    // Trigger deployment
    await fetch(`https://api.netlify.com/api/v1/sites/${netlifyData.id}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
      },
    });

    return NextResponse.json({
      url: netlifyData.deploy_url,
    });
  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: 'Failed to deploy to Netlify' },
      { status: 500 }
    );
  }
} 