/**
 * ============================================
 * GROWTRACK — CREATE ENTRY
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
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

// ─── SHARED INPUT STYLES ──────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-3 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:border-[#e9924b]/50 focus:ring-2 focus:ring-[#e9924b]/10 transition-all';

const selectClass =
  'w-full px-4 py-3 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] text-sm focus:outline-none focus:border-[#e9924b]/50 focus:ring-2 focus:ring-[#e9924b]/10 transition-all';

const labelClass = 'block text-sm font-semibold text-[#1e3a6e]/80 mb-2';

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; required?: boolean; children: React.ReactNode }> = ({
  title, required, children,
}) => (
  <div>
    <p className={labelClass}>
      {title}
      {required && <span className="text-[#e9924b] ml-0.5">*</span>}
    </p>
    {children}
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const CreateEntry: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [children, setChildren] = useState<string[]>([]);

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
    const init = async () => {
      try {
        const [optRes, childRes] = await Promise.all([
          api.get('/growtrack/options'),
          api.get('/growtrack/children'),
        ]);
        setOptions(optRes.data.data);
        setChildren(childRes.data.data.children || []);
      } catch {
        toast.error('Failed to load options');
      }
    };
    init();
  }, []);

  const addBehavior = (b: string) => {
    if (b.trim() && !behaviors.includes(b) && behaviors.length < 10) {
      setBehaviors([...behaviors, b.trim()]);
      setCustomBehavior('');
    }
  };

  const addTrigger = (t: string) => {
    if (t.trim() && !triggers.includes(t) && triggers.length < 10) {
      setTriggers([...triggers, t.trim()]);
      setCustomTrigger('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMood = mood === 'custom' ? customMood.trim() : mood;
    if (!selectedMood) { toast.error('Please select a mood'); return; }
    if (behaviors.length === 0) { toast.error('Please add at least one behavior'); return; }
    if (triggers.length === 0) { toast.error('Please add at least one trigger'); return; }
    if (trackedPersonType === 'CHILD') {
      const name = trackedPersonName === 'new' ? newChildName : trackedPersonName;
      if (!name) { toast.error('Please enter a child name'); return; }
    }

    setLoading(true);
    try {
      await api.post('/growtrack/entries', {
        mood: selectedMood,
        moodIntensity,
        behaviors,
        triggers,
        notes: notes.trim() || undefined,
        trackedPersonType,
        trackedPersonName: trackedPersonType === 'CHILD'
          ? (trackedPersonName === 'new' ? newChildName : trackedPersonName)
          : undefined,
      });
      toast.success('Entry recorded');
      navigate('/growtrack');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  if (!options) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e9924b]/30 border-t-[#e9924b] rounded-full animate-spin" />
      </div>
    );
  }

  const intensityColor =
    moodIntensity <= 3 ? '#e9924b' : moodIntensity <= 6 ? '#659ec3' : '#1e3a6e';

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* ── Header ───────────────────────────────── */}
        <div className="bg-[#1e3a6e] py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8">
            <button
              onClick={() => navigate('/growtrack')}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to GrowTrack
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">New Entry</span>
            </div>
            <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl">
              Record a mood entry
            </h1>
            <p className="text-white/45 text-sm mt-2">
              Track mood, behaviors, and triggers to build a clearer picture over time.
            </p>
          </div>
        </div>

        {/* ── Form ─────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Who is this for? */}
            <Section title="Who is this entry for?" required>
              <div className="grid grid-cols-2 gap-3">
                {(['SELF', 'CHILD'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTrackedPersonType(type)}
                    className={`p-4 rounded-xl border text-sm font-semibold transition-all ${
                      trackedPersonType === type
                        ? 'border-[#e9924b] bg-[#e9924b]/8 text-[#e9924b]'
                        : 'border-[#1e3a6e]/15 text-[#1e3a6e]/60 hover:border-[#1e3a6e]/30'
                    }`}
                  >
                    {type === 'SELF' ? 'Myself' : 'My Child'}
                  </button>
                ))}
              </div>
            </Section>

            {/* Child selection */}
            {trackedPersonType === 'CHILD' && (
              <Section title="Select child" required>
                <select
                  value={trackedPersonName}
                  onChange={(e) => setTrackedPersonName(e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Select a child</option>
                  {children.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="new">Add new child...</option>
                </select>
                {trackedPersonName === 'new' && (
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Child's name"
                    className={`${inputClass} mt-3`}
                    required
                  />
                )}
              </Section>
            )}

            {/* Mood */}
            <Section title="Mood" required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.moodTypes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      mood === m
                        ? 'border-[#e9924b] bg-[#e9924b]/8 text-[#e9924b]'
                        : 'border-[#1e3a6e]/12 text-[#1e3a6e]/60 hover:border-[#1e3a6e]/25 hover:text-[#1e3a6e]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMood('custom')}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    mood === 'custom'
                      ? 'border-[#e9924b] bg-[#e9924b]/8 text-[#e9924b]'
                      : 'border-dashed border-[#1e3a6e]/20 text-[#1e3a6e]/40 hover:border-[#e9924b]/30'
                  }`}
                >
                  Custom...
                </button>
              </div>
              {mood === 'custom' && (
                <input
                  type="text"
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  placeholder="Describe the mood"
                  className={`${inputClass} mt-3`}
                  required
                />
              )}
            </Section>

            {/* Intensity */}
            <Section title={`Mood intensity — ${moodIntensity} / 10`} required>
              <div className="bg-white border border-[#1e3a6e]/12 rounded-xl px-5 py-5">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodIntensity}
                  onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: intensityColor }}
                />
                <div className="flex justify-between text-xs text-[#1e3a6e]/30 mt-3">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </Section>

            {/* Behaviors */}
            <Section title="Behaviors observed" required>
              {behaviors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {behaviors.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#659ec3]/10 text-[#659ec3] rounded-full text-xs font-medium"
                    >
                      {b}
                      <button type="button" onClick={() => setBehaviors(behaviors.filter(x => x !== b))} className="hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {options.behaviorExamples
                  .filter(b => !behaviors.includes(b))
                  .slice(0, 6)
                  .map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => addBehavior(b)}
                      disabled={behaviors.length >= 10}
                      className="px-3 py-2 text-left rounded-xl border border-dashed border-[#1e3a6e]/15 text-[#1e3a6e]/50 text-xs hover:border-[#659ec3]/40 hover:text-[#659ec3] transition-all disabled:opacity-30"
                    >
                      + {b}
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBehavior}
                  onChange={(e) => setCustomBehavior(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBehavior(customBehavior); } }}
                  placeholder="Add custom behavior..."
                  className={inputClass}
                  disabled={behaviors.length >= 10}
                />
                <button
                  type="button"
                  onClick={() => addBehavior(customBehavior)}
                  disabled={behaviors.length >= 10}
                  className="w-10 h-10 flex-shrink-0 bg-[#659ec3] text-white rounded-xl flex items-center justify-center hover:bg-[#4d87b2] transition-colors disabled:opacity-30 self-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#1e3a6e]/30 mt-1.5">{behaviors.length}/10 added</p>
            </Section>

            {/* Triggers */}
            <Section title="Triggers / stressors" required>
              {triggers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {triggers.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e9924b]/10 text-[#e9924b] rounded-full text-xs font-medium"
                    >
                      {t}
                      <button type="button" onClick={() => setTriggers(triggers.filter(x => x !== t))} className="hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {options.triggerExamples
                  .filter(t => !triggers.includes(t))
                  .slice(0, 6)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTrigger(t)}
                      disabled={triggers.length >= 10}
                      className="px-3 py-2 text-left rounded-xl border border-dashed border-[#1e3a6e]/15 text-[#1e3a6e]/50 text-xs hover:border-[#e9924b]/40 hover:text-[#e9924b] transition-all disabled:opacity-30"
                    >
                      + {t}
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTrigger(customTrigger); } }}
                  placeholder="Add custom trigger..."
                  className={inputClass}
                  disabled={triggers.length >= 10}
                />
                <button
                  type="button"
                  onClick={() => addTrigger(customTrigger)}
                  disabled={triggers.length >= 10}
                  className="w-10 h-10 flex-shrink-0 bg-[#e9924b] text-white rounded-xl flex items-center justify-center hover:bg-[#d4762a] transition-colors disabled:opacity-30 self-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#1e3a6e]/30 mt-1.5">{triggers.length}/10 added</p>
            </Section>

            {/* Notes */}
            <Section title="Additional notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any context or observations worth noting..."
                rows={4}
                maxLength={options.validation.maxNotesLength}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-[#1e3a6e]/30 mt-1.5 text-right">
                {notes.length}/{options.validation.maxNotesLength}
              </p>
            </Section>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/growtrack')}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-[#1e3a6e]/20 text-[#1e3a6e]/60 rounded-xl text-sm font-semibold hover:bg-[#1e3a6e]/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#e9924b] hover:bg-[#d4762a] text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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