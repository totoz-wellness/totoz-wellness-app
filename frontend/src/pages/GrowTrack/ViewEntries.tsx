/**
 * ============================================
 * GROWTRACK — VIEW ENTRIES
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, Trash2, User, Users, Plus } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../config/api';
import toast from 'react-hot-toast';

interface Entry {
  id: number;
  mood: string;
  moodIntensity: number;
  behaviors: string[];
  triggers: string[];
  notes: string | null;
  trackedPersonType: 'SELF' | 'CHILD';
  trackedPersonName: string | null;
  recordedAt: string;
}

interface Metrics {
  totalEntries: number;
  averageMoodIntensity: number;
  predominantMood: string;
  moodTrend: string;
  topBehaviors: Array<{ behavior: string; frequency: number }>;
  topTriggers: Array<{ trigger: string; frequency: number }>;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function intensityStyle(n: number): { bg: string; text: string; label: string } {
  if (n <= 3) return { bg: 'bg-[#e9924b]/10', text: 'text-[#e9924b]', label: 'Low' };
  if (n <= 6) return { bg: 'bg-[#659ec3]/10', text: 'text-[#659ec3]', label: 'Medium' };
  return { bg: 'bg-[#1e3a6e]/8', text: 'text-[#1e3a6e]', label: 'High' };
}

const TREND_LABEL: Record<string, string> = {
  IMPROVING: 'Improving',
  STABLE: 'Stable',
  DECLINING: 'Declining',
  INSUFFICIENT_DATA: 'Not enough data',
};

const selectClass =
  'w-full px-4 py-2.5 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] text-sm focus:outline-none focus:border-[#e9924b]/50 transition-all';

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const ViewEntries: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [children, setChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [personType, setPersonType] = useState<'ALL' | 'SELF' | 'CHILD'>('ALL');
  const [selectedChild, setSelectedChild] = useState('');
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/growtrack/children').then(r => setChildren(r.data.data.children || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchEntries(); }, [period, personType, selectedChild]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ period });
      if (personType !== 'ALL') p.append('trackedPersonType', personType);
      if (selectedChild) p.append('trackedPersonName', selectedChild);
      const r = await api.get(`/growtrack/entries?${p.toString()}`);
      setEntries(r.data.data.entries || []);
      setMetrics(r.data.data.metrics || null);
    } catch {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/growtrack/entries/${id}`);
      toast.success('Entry deleted');
      setDeleteModal(null);
      fetchEntries();
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* Header */}
        <div className="bg-[#1e3a6e] py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
            <button onClick={() => navigate('/growtrack')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to GrowTrack
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-[#e9924b]" />
                  <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Entry history</span>
                </div>
                <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl">Your entries</h1>
                <p className="text-white/45 text-sm mt-1">{entries.length} {entries.length === 1 ? 'entry' : 'entries'} found</p>
              </div>
              <button
                onClick={() => navigate('/growtrack/create')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all"
              >
                <Plus className="w-4 h-4" />
                New entry
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-10">

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#e9924b]" />
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/40">Filters</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e3a6e]/60 mb-1.5">Time period</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className={selectClass}>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="year">Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1e3a6e]/60 mb-1.5">Person</label>
                <select value={personType} onChange={(e) => { setPersonType(e.target.value as any); if (e.target.value !== 'CHILD') setSelectedChild(''); }} className={selectClass}>
                  <option value="ALL">All</option>
                  <option value="SELF">Myself</option>
                  <option value="CHILD">Children</option>
                </select>
              </div>
              {personType === 'CHILD' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1e3a6e]/60 mb-1.5">Select child</label>
                  <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className={selectClass}>
                    <option value="">All children</option>
                    {children.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Metrics summary */}
          {metrics && entries.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6 mb-8">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/40 mb-5">Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
                {[
                  { label: 'Avg mood', value: `${metrics.averageMoodIntensity}/10`, accent: '#e9924b' },
                  { label: 'Most common', value: metrics.predominantMood, accent: '#1e3a6e' },
                  { label: 'Trend', value: TREND_LABEL[metrics.moodTrend] || '—', accent: '#659ec3' },
                  { label: 'Total entries', value: metrics.totalEntries.toString(), accent: '#659ec3' },
                ].map(({ label, value, accent }) => (
                  <div key={label}>
                    <p className="text-[#1e3a6e]/40 text-xs mb-1">{label}</p>
                    <p className="font-heading font-bold text-[#1e3a6e] text-base" style={{ color: accent }}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.topBehaviors.length > 0 && (
                  <div>
                    <p className="text-xs text-[#1e3a6e]/40 mb-2">Top behaviors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {metrics.topBehaviors.slice(0, 5).map(({ behavior, frequency }) => (
                        <span key={behavior} className="px-2.5 py-1 bg-[#659ec3]/10 text-[#659ec3] rounded-full text-xs font-medium">
                          {behavior} ({frequency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {metrics.topTriggers.length > 0 && (
                  <div>
                    <p className="text-xs text-[#1e3a6e]/40 mb-2">Top triggers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {metrics.topTriggers.slice(0, 5).map(({ trigger, frequency }) => (
                        <span key={trigger} className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] rounded-full text-xs font-medium">
                          {trigger} ({frequency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Entries */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#e9924b]/30 border-t-[#e9924b] rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a6e]/6 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-[#1e3a6e]/30" />
              </div>
              <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1">No entries found</p>
              <p className="text-[#1e3a6e]/45 text-sm mb-8">Try adjusting your filters, or create your first entry.</p>
              <button onClick={() => navigate('/growtrack/create')} className="px-6 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-full hover:bg-[#d4762a] transition-all">
                Create entry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const is = intensityStyle(entry.moodIntensity);
                return (
                  <div key={entry.id} className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm hover:shadow-md transition-shadow p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        {/* Intensity badge */}
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${is.bg}`}>
                          <span className={`font-heading font-extrabold text-lg leading-none ${is.text}`}>{entry.moodIntensity}</span>
                          <span className={`text-[9px] font-medium ${is.text} opacity-60`}>/10</span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-[#1e3a6e] text-base leading-tight">{entry.mood}</h3>
                          <div className="flex items-center gap-2 text-[#1e3a6e]/40 text-xs mt-0.5">
                            {entry.trackedPersonType === 'SELF' ? (
                              <><User className="w-3.5 h-3.5" />Myself</>
                            ) : (
                              <><Users className="w-3.5 h-3.5" />{entry.trackedPersonName}</>
                            )}
                            <span className="text-[#1e3a6e]/20">·</span>
                            <span>
                              {new Date(entry.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteModal(entry.id)}
                        className="p-2 text-[#1e3a6e]/20 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Behaviors */}
                    <div className="mb-3">
                      <p className="text-[#1e3a6e]/35 text-[10px] uppercase tracking-widest mb-2 font-semibold">Behaviors</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.behaviors.map((b, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#659ec3]/8 text-[#659ec3] rounded-full text-xs font-medium">{b}</span>
                        ))}
                      </div>
                    </div>

                    {/* Triggers */}
                    <div className={entry.notes ? 'mb-3' : ''}>
                      <p className="text-[#1e3a6e]/35 text-[10px] uppercase tracking-widest mb-2 font-semibold">Triggers</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.triggers.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#e9924b]/8 text-[#e9924b] rounded-full text-xs font-medium">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-4 pt-4 border-t border-[#1e3a6e]/6">
                        <p className="text-[#1e3a6e]/55 text-sm leading-relaxed">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delete modal */}
      {deleteModal !== null && (
        <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
            <h3 className="font-heading font-bold text-[#1e3a6e] text-lg mb-2">Delete entry?</h3>
            <p className="text-[#1e3a6e]/55 text-sm mb-7 leading-relaxed">
              This action cannot be undone. The entry will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-[#1e3a6e]/20 text-[#1e3a6e]/60 rounded-xl text-sm font-semibold hover:bg-[#1e3a6e]/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ViewEntries;