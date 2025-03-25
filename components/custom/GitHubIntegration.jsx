import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { toast } from 'sonner';

const GitHubIntegration = ({ files }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleGitHubConnect = async () => {
    setIsConnecting(true);
    try {
      // Redirect to GitHub OAuth
      window.location.href = '/api/github/auth';
    } catch (error) {
      toast.error('Failed to connect to GitHub');
      console.error('GitHub connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRepoSubmit = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files, repoUrl }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Code pushed to GitHub successfully!');
        if (data.pullRequestUrl) {
          window.open(data.pullRequestUrl, '_blank');
        } else {
          window.open(data.repoUrl, '_blank');
        }
      } else {
        throw new Error(data.error || 'Failed to push to GitHub');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to push to GitHub');
      console.error('GitHub push error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if user is connected to GitHub
  React.useEffect(() => {
    const checkGitHubConnection = async () => {
      try {
        const response = await fetch('/api/github/check-connection');
        const data = await response.json();
        setIsConnected(data.connected);
      } catch (error) {
        console.error('Failed to check GitHub connection:', error);
      }
    };
    checkGitHubConnection();
  }, []);

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <button
          onClick={handleGitHubConnect}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Github className="w-4 h-4" />
          {isConnecting ? 'Connecting...' : 'Connect GitHub'}
        </button>
      ) : (
        <form onSubmit={handleRepoSubmit} className="space-y-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL"
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={isConnecting || !repoUrl}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Pull Request
          </button>
          <p className="text-sm text-gray-600">
            The code will be pushed to a new branch and a pull request will be created.
          </p>
        </form>
      )}
    </div>
  );
};

export default GitHubIntegration; 