/**
 * ============================================
 * GROWTRACK - CREATE ENTRY
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../config/api';
import toast from 'react-hot-toast';

interface Options {
  moodTypes: string[];
  behaviorExamples: string[];
  triggerExamples: string[];
  validation: {
    moodIntensityRange: { min: number; max: number };
    maxNotesLength: number;
  };
}

const CreateEntry: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [children, setChildren] = useState<string[]>([]);

  // Form state
  const [trackedPersonType, setTrackedPersonType] = useState<'SELF' | 'CHILD'>('SELF');
  const [trackedPersonName, setTrackedPersonName] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [mood, setMood] = useState('');
  const [customMood, setCustomMood] = useState('');
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [customBehavior, setCustomBehavior] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOptions();
    fetchChildren();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await api.get('/growtrack/options');
      setOptions(response.data. data);
    } catch (error) {
      toast.error('Failed to load options');
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await api.get('/growtrack/children');
      setChildren(response.data.data. children || []);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  const handleAddBehavior = (behavior: string) => {
    if (behavior && !behaviors.includes(behavior) && behaviors.length < 10) {
      setBehaviors([...behaviors, behavior]);
      setCustomBehavior('');
    }
  };

  const handleRemoveBehavior = (behavior: string) => {
    setBehaviors(behaviors.filter(b => b !== behavior));
  };

  const handleAddTrigger = (trigger: string) => {
    if (trigger && !triggers.includes(trigger) && triggers. length < 10) {
      setTriggers([...triggers, trigger]);
      setCustomTrigger('');
    }
  };

  const handleRemoveTrigger = (trigger: string) => {
    setTriggers(triggers.filter(t => t !== trigger));
  };

  const handleSubmit = async (e: React. FormEvent) => {
    e.preventDefault();

    // Validation
    const selectedMood = mood === 'custom' ? customMood : mood;
    
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    if (behaviors.length === 0) {
      toast.error('Please add at least one behavior');
      return;
    }

    if (triggers.length === 0) {
      toast.error('Please add at least one trigger');
      return;
    }

    if (trackedPersonType === 'CHILD') {
      const childName = trackedPersonName === 'new' ?  newChildName : trackedPersonName;
      if (!childName) {
        toast.error('Please enter child name');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        mood: selectedMood,
        moodIntensity,
        behaviors,
        triggers,
        notes: notes. trim() || undefined,
        trackedPersonType,
        trackedPersonName: trackedPersonType === 'CHILD' 
          ? (trackedPersonName === 'new' ? newChildName : trackedPersonName)
          : undefined
      };

      await api.post('/growtrack/entries', payload);

      toast.success('Entry recorded successfully!  🎉');
      navigate('/growtrack');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create entry';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (! options) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate('/growtrack')}
          className="flex items-center gap-2 text-gray-600 hover:text-teal transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to GrowTrack
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            New Entry
          </h1>
          <p className="text-gray-600 mb-8">
            Track mood, behavior, and triggers to understand patterns over time
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Who is this for? */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Who is this entry for?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTrackedPersonType('SELF')}
                  className={`p-4 rounded-xl border-2 transition ${
                    trackedPersonType === 'SELF'
                      ? 'border-teal bg-teal/10 text-teal font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Myself
                </button>
                <button
                  type="button"
                  onClick={() => setTrackedPersonType('CHILD')}
                  className={`p-4 rounded-xl border-2 transition ${
                    trackedPersonType === 'CHILD'
                      ? 'border-teal bg-teal/10 text-teal font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  My Child
                </button>
              </div>
            </div>

            {/* Child Selection */}
            {trackedPersonType === 'CHILD' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Child
                </label>
                <select
                  value={trackedPersonName}
                  onChange={(e) => setTrackedPersonName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none"
                  required
                >
                  <option value="">-- Select a child --</option>
                  {children.map((child) => (
                    <option key={child} value={child}>{child}</option>
                  ))}
                  <option value="new">+ Add New Child</option>
                </select>

                {trackedPersonName === 'new' && (
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Enter child's name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none mt-3"
                    required
                  />
                )}
              </div>
            )}

            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mood *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {options.moodTypes.map((moodType) => (
                  <button
                    key={moodType}
                    type="button"
                    onClick={() => setMood(moodType)}
                    className={`p-3 rounded-xl border-2 transition text-sm ${
                      mood === moodType
                        ? 'border-teal bg-teal/10 text-teal font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {moodType}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMood('custom')}
                  className={`p-3 rounded-xl border-2 transition text-sm ${
                    mood === 'custom'
                      ? 'border-teal bg-teal/10 text-teal font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  + Custom
                </button>
              </div>

              {mood === 'custom' && (
                <input
                  type="text"
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  placeholder="Enter custom mood"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none mt-3"
                  required
                />
              )}
            </div>

            {/* Mood Intensity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mood Intensity: {moodIntensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(parseInt(e.target. value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Behaviors */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Behaviors Observed *
              </label>
              
              {/* Selected behaviors */}
              {behaviors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {behaviors.map((behavior) => (
                    <span
                      key={behavior}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-teal/10 text-teal rounded-full text-sm font-medium"
                    >
                      {behavior}
                      <button
                        type="button"
                        onClick={() => handleRemoveBehavior(behavior)}
                        className="hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Behavior suggestions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {options.behaviorExamples
                  .filter(b => ! behaviors.includes(b))
                  .slice(0, 6)
                  .map((behavior) => (
                    <button
                      key={behavior}
                      type="button"
                      onClick={() => handleAddBehavior(behavior)}
                      className="p-2 rounded-lg border border-gray-200 hover:border-teal hover:bg-teal/5 transition text-sm"
                      disabled={behaviors.length >= 10}
                    >
                      + {behavior}
                    </button>
                  ))}
              </div>

              {/* Custom behavior */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBehavior}
                  onChange={(e) => setCustomBehavior(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBehavior(customBehavior);
                    }
                  }}
                  placeholder="Add custom behavior..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none"
                  disabled={behaviors.length >= 10}
                />
                <button
                  type="button"
                  onClick={() => handleAddBehavior(customBehavior)}
                  className="px-4 py-2 bg-teal text-white rounded-xl hover:bg-teal/90 transition"
                  disabled={behaviors.length >= 10}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {behaviors.length}/10 behaviors added
              </p>
            </div>

            {/* Triggers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Triggers/Stressors *
              </label>
              
              {/* Selected triggers */}
              {triggers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {triggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {trigger}
                      <button
                        type="button"
                        onClick={() => handleRemoveTrigger(trigger)}
                        className="hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Trigger suggestions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {options.triggerExamples
                  .filter(t => !triggers.includes(t))
                  .slice(0, 6)
                  . map((trigger) => (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => handleAddTrigger(trigger)}
                      className="p-2 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition text-sm"
                      disabled={triggers.length >= 10}
                    >
                      + {trigger}
                    </button>
                  ))}
              </div>

              {/* Custom trigger */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTrigger(customTrigger);
                    }
                  }}
                  placeholder="Add custom trigger..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none"
                  disabled={triggers.length >= 10}
                />
                <button
                  type="button"
                  onClick={() => handleAddTrigger(customTrigger)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
                  disabled={triggers. length >= 10}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {triggers.length}/10 triggers added
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional observations or context..."
                rows={4}
                maxLength={options.validation.maxNotesLength}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/{options.validation.maxNotesLength} characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/growtrack')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition font-semibold flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateEntry;