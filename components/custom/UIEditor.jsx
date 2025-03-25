import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const UIEditor = ({ files, onUpdateFiles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');

  const handleElementClick = (element) => {
    setSelectedElement(element);
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedElement || !editPrompt) return;

    try {
      const response = await fetch('/api/gen-ai-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Please modify the following UI element based on this request: "${editPrompt}". The element is: ${JSON.stringify(selectedElement)}. Return only the modified element code.`,
        }),
      });

      const data = await response.json();
      
      if (data.files) {
        // Update the files with the modified element
        const updatedFiles = { ...files };
        Object.entries(data.files).forEach(([path, content]) => {
          if (updatedFiles[path]) {
            // Replace the old element with the new one
            const oldCode = updatedFiles[path].code;
            const newCode = content.code;
            updatedFiles[path].code = oldCode.replace(
              selectedElement.originalCode,
              newCode
            );
          }
        });

        onUpdateFiles(updatedFiles);
        toast.success('UI element updated successfully!');
        setIsEditing(false);
        setSelectedElement(null);
        setEditPrompt('');
      }
    } catch (error) {
      toast.error('Failed to update UI element');
      console.error('UI update error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Edit2 className="w-4 h-4" />
        <span className="text-sm font-medium">UI Editor Mode</span>
      </div>

      {isEditing && selectedElement && (
        <div className="space-y-4 p-4 border rounded-md">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Describe your changes:
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              rows={3}
              placeholder="Example: Make the button more prominent with a gradient background"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditSubmit}
              disabled={!editPrompt}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Element
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedElement(null);
                setEditPrompt('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Click on any UI element to edit it. The AI will help you modify it based on your request.
      </div>
    </div>
  );
};

export default UIEditor; 