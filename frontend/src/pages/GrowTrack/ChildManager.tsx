/**
 * ============================================
 * GROWTRACK — CHILD MANAGER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @fix         Null safety guards to prevent white-screen crashes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../config/api';
import toast from 'react-hot-toast';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function safe(val: unknown, fallback = '—'): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s === '' ? fallback : s;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-3 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:border-[#e9924b]/50 focus:ring-2 focus:ring-[#e9924b]/10 transition-all';

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const ChildManager: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChildName, setNewChildName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchChildren(); }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const r = await api.get('/growtrack/children');
      // Handle both r.data.data.children and r.data.children
      const raw = r.data?.data?.children ?? r.data?.children ?? r.data?.data ?? [];
      setChildren(Array.isArray(raw) ? raw.filter(Boolean) : []);
    } catch {
      toast.error('Failed to load children');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newChildName.trim();
    if (!name) { toast.error('Please enter a name'); return; }
    if (children.includes(name)) { toast.error('This child is already added'); return; }

    setAdding(true);
    try {
      await api.post('/growtrack/children', { name });
      toast.success(`${name} added`);
      setNewChildName('');
      fetchChildren();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add child');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (name: string) => {
    setDeleting(true);
    try {
      await api.delete(`/growtrack/children/${encodeURIComponent(name)}`);
      toast.success(`${name} removed`);
      setDeleteTarget(null);
      fetchChildren();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove child');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <div className="bg-[#1e3a6e] py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8">
            <button onClick={() => navigate('/growtrack')}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to GrowTrack
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Child Profiles</span>
            </div>
            <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl">Manage children</h1>
            <p className="text-white/45 text-sm mt-2">
              Add children here so you can track their moods and behaviors separately.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-6">

          {/* Add child form */}
          <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/40 mb-4">Add a child</p>
            <form onSubmit={handleAdd} className="flex gap-3">
              <input
                type="text"
                value={newChildName}
                onChange={e => setNewChildName(e.target.value)}
                placeholder="Child's name"
                className={inputClass}
                disabled={adding}
              />
              <button
                type="submit"
                disabled={adding || !newChildName.trim()}
                className="flex items-center gap-2 px-5 py-3 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all disabled:opacity-40 flex-shrink-0"
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add
              </button>
            </form>
          </div>

          {/* Children list */}
          <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/40 mb-5">
              Children ({loading ? '…' : children.length})
            </p>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-[#1e3a6e]/6 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-[#1e3a6e]/6 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#1e3a6e]/30" />
                </div>
                <p className="text-[#1e3a6e]/45 text-sm">No children added yet.</p>
                <p className="text-[#1e3a6e]/30 text-xs mt-1">Add a child above to start tracking them separately.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {children.map((child) => (
                  <div
                    key={child}
                    className="flex items-center justify-between px-4 py-3.5 bg-[#fbfbfb] border border-[#1e3a6e]/8 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#659ec3]/15 flex items-center justify-center flex-shrink-0">
                        <span className="font-heading font-bold text-[#659ec3] text-sm">
                          {safe(child, '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-[#1e3a6e] text-sm">{safe(child)}</span>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(child)}
                      className="p-2 text-[#1e3a6e]/20 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                      aria-label={`Remove ${child}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info note */}
          <p className="text-[#1e3a6e]/35 text-xs text-center leading-relaxed px-4">
            Removing a child does not delete their past entries — it only removes them from the selection list.
          </p>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
            <h3 className="font-heading font-bold text-[#1e3a6e] text-lg mb-2">Remove {safe(deleteTarget)}?</h3>
            <p className="text-[#1e3a6e]/55 text-sm mb-7 leading-relaxed">
              They will be removed from the child list, but existing entries will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-[#1e3a6e]/20 text-[#1e3a6e]/60 rounded-xl text-sm font-semibold hover:bg-[#1e3a6e]/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChildManager;