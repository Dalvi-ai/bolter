import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const NetlifyDeploy = ({ files }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [netlifyToken, setNetlifyToken] = useState('');

  const handleDeploy = async () => {
    if (!netlifyToken) {
      setShowTokenInput(true);
      return;
    }

    setIsDeploying(true);
    try {
      const response = await fetch('/api/netlify/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files, netlifyToken }),
      });

      const data = await response.json();
      
      if (data.url) {
        toast.success('Deployment successful!');
        window.open(data.url, '_blank');
      } else {
        throw new Error('Deployment failed');
      }
    } catch (error) {
      toast.error('Failed to deploy to Netlify');
      console.error('Deployment error:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-4">
      {showTokenInput ? (
        <div className="space-y-2">
          <input
            type="password"
            value={netlifyToken}
            onChange={(e) => setNetlifyToken(e.target.value)}
            placeholder="Enter your Netlify access token"
            className="w-full px-4 py-2 border rounded-md"
          />
          <div className="flex gap-2">
            <button
              onClick={handleDeploy}
              disabled={!netlifyToken || isDeploying}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
            <button
              onClick={() => {
                setShowTokenInput(false);
                setNetlifyToken('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Get your Netlify access token from{' '}
            <a
              href="https://app.netlify.com/user/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Netlify User Settings
            </a>
          </p>
        </div>
      ) : (
        <button
          onClick={() => setShowTokenInput(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          Deploy to Netlify
        </button>
      )}
    </div>
  );
};

export default NetlifyDeploy; 