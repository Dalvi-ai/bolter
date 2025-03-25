import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Octokit } from '@octokit/rest';

export async function POST(req) {
  try {
    const { files, repoUrl } = await req.json();
    const githubToken = cookies().get('github_token')?.value;

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 401 }
      );
    }

    const octokit = new Octokit({
      auth: githubToken,
    });

    // Extract owner and repo from URL
    const [owner, repo] = repoUrl
      .replace('https://github.com/', '')
      .replace('.git', '')
      .split('/');

    // Verify the user has access to the repository
    try {
      await octokit.repos.get({
        owner,
        repo,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'You do not have access to this repository' },
        { status: 403 }
      );
    }

    // Get the default branch
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    const defaultBranch = repoData.default_branch;

    // Create a new branch for the changes
    const branchName = `bolt-update-${Date.now()}`;
    const { data: defaultBranchData } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch,
    });

    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: defaultBranchData.commit.sha,
    });

    // Push files to the repository
    for (const [path, content] of Object.entries(files)) {
      try {
        // Check if file exists
        try {
          await octokit.repos.getContent({
            owner,
            repo,
            path: path.startsWith('/') ? path.slice(1) : path,
            ref: branchName,
          });
        } catch (error) {
          // File doesn't exist, create it
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: path.startsWith('/') ? path.slice(1) : path,
            message: `Add ${path}`,
            content: Buffer.from(content.code).toString('base64'),
            branch: branchName,
          });
        }
      } catch (error) {
        console.error(`Error pushing file ${path}:`, error);
        throw error;
      }
    }

    // Create a pull request
    const { data: pullRequest } = await octokit.pulls.create({
      owner,
      repo,
      title: 'Bolt-generated code update',
      body: 'This pull request was created by Bolt to update the code.',
      head: branchName,
      base: defaultBranch,
    });

    return NextResponse.json({
      success: true,
      repoUrl: `https://github.com/${owner}/${repo}`,
      pullRequestUrl: pullRequest.html_url,
    });
  } catch (error) {
    console.error('GitHub push error:', error);
    return NextResponse.json(
      { error: 'Failed to push to GitHub' },
      { status: 500 }
    );
  }
} 