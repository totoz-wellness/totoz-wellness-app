import React, { useState } from 'react';
import { useKidsCorner } from '../../contexts/KidsCornerContext';

const AVATAR_EMOJIS = ['😊', '🦁', '🐻', '🦊', '🐰', '🐼', '🐯', '🐨', '🐸', '🦉'];

const ChildSelector: React.FC = () => {
  const { children, activeChild, setActiveChild, createNewChild, loading } = useKidsCorner();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(5);
  const [selectedEmoji, setSelectedEmoji] = useState('😊');

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChildName.trim()) {
      alert('Please enter a name');
      return;
    }

    const child = await createNewChild(newChildName.trim(), newChildAge, selectedEmoji);
    
    if (child) {
      setShowCreateForm(false);
      setNewChildName('');
      setNewChildAge(5);
      setSelectedEmoji('😊');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
      <h3 className="font-black text-xl mb-4 text-gray-800 flex items-center gap-2">
        <span className="text-2xl">👨‍👩‍👧‍👦</span> Select Child
      </h3>

      {/* Existing Children */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => setActiveChild(child)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              activeChild?.id === child.id
                ? 'border-teal-500 bg-teal-50 scale-105 shadow-lg'
                : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-4xl mb-2">{child.avatarEmoji}</div>
            <div className="font-bold text-gray-800">{child.name}</div>
            <div className="text-sm text-gray-500">Age {child.age}</div>
            {activeChild?.id === child.id && (
              <div className="mt-2 text-xs text-teal-600 font-bold">✓ Active</div>
            )}
          </button>
        ))}

        {/* Add New Child Button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="p-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-teal-500 transition-all hover:bg-teal-50"
        >
          <div className="text-4xl mb-2">➕</div>
          <div className="font-bold text-gray-600">Add Child</div>
        </button>
      </div>

      {/* Create Child Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-black text-2xl mb-6 text-gray-800">Add New Child Profile</h3>
            
            <form onSubmit={handleCreateChild} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block font-bold mb-2 text-gray-700">Child's Name</label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="e.g., Emma"
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label className="block font-bold mb-2 text-gray-700">Age</label>
                <input
                  type="number"
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(parseInt(e.target.value))}
                  min={3}
                  max={12}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Avatar Emoji */}
              <div>
                <label className="block font-bold mb-2 text-gray-700">Choose Avatar</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-3xl p-3 rounded-xl border-2 transition-all ${
                        selectedEmoji === emoji
                          ? 'border-teal-500 bg-teal-50 scale-110'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Children State */}
      {children.length === 0 && !showCreateForm && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👶</div>
          <p className="text-gray-600 mb-4">No child profiles yet. Create one to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600"
          >
            Create First Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;