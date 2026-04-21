/**
 * ============================================
 * GROWTRACK - VIEW ENTRIES
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, Trash2, Edit, User, Users } from 'lucide-react';
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

const ViewEntries: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [children, setChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [personType, setPersonType] = useState<'ALL' | 'SELF' | 'CHILD'>('ALL');
  const [selectedChild, setSelectedChild] = useState<string>('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [period, personType, selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await api. get('/growtrack/children');
      setChildren(response.data.data. children || []);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params. append('period', period);
      
      if (personType !== 'ALL') {
        params.append('trackedPersonType', personType);
      }
      
      if (selectedChild) {
        params. append('trackedPersonName', selectedChild);
      }

      const response = await api.get(`/growtrack/entries?${params. toString()}`);
      setEntries(response.data.data. entries || []);
      setMetrics(response.data.data. metrics || null);
    } catch (error) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/growtrack/entries/${id}`);
      toast.success('Entry deleted successfully');
      setDeleteModal(null);
      fetchEntries();
    } catch (error) {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  const getMoodColor = (intensity: number): string => {
    if (intensity <= 3) return 'text-red-600 bg-red-50';
    if (intensity <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getTrendBadge = (trend: string) => {
    const config = {
      IMPROVING: { label: '📈 Improving', color: 'bg-green-100 text-green-700' },
      STABLE: { label: '➡️ Stable', color: 'bg-blue-100 text-blue-700' },
      DECLINING: { label: '📉 Declining', color: 'bg-red-100 text-red-700' },
      INSUFFICIENT_DATA: { label: 'ℹ️ Not enough data', color: 'bg-gray-100 text-gray-600' }
    };
    return config[trend as keyof typeof config] || config.INSUFFICIENT_DATA;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <button
          onClick={() => navigate('/growtrack')}
          className="flex items-center gap-2 text-gray-600 hover:text-teal transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to GrowTrack
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Entries</h1>
            <p className="text-gray-600 mt-1">
              {entries.length} {entries.length === 1 ?  'entry' : 'entries'} found
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-teal" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
            </div>

            {/* Person Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person Type
              </label>
              <select
                value={personType}
                onChange={(e) => {
                  setPersonType(e.target.value as 'ALL' | 'SELF' | 'CHILD');
                  if (e.target.value !== 'CHILD') setSelectedChild('');
                }}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none"
              >
                <option value="ALL">All</option>
                <option value="SELF">Myself</option>
                <option value="CHILD">Children</option>
              </select>
            </div>

            {/* Child Filter */}
            {personType === 'CHILD' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Child
                </label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e. target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none"
                >
                  <option value="">All Children</option>
                  {children.map((child) => (
                    <option key={child} value={child}>{child}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Summary */}
        {metrics && entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Avg Mood"
                value={`${metrics. averageMoodIntensity}/10`}
                color="text-blue-600"
              />
              <MetricCard
                label="Most Common"
                value={metrics.predominantMood}
                color="text-purple-600"
              />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Trend</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTrendBadge(metrics.moodTrend). color}`}>
                  {getTrendBadge(metrics.moodTrend).label}
                </span>
              </div>
              <MetricCard
                label="Total Entries"
                value={metrics.totalEntries. toString()}
                color="text-teal"
              />
            </div>

            {/* Top Behaviors */}
            {metrics.topBehaviors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Top Behaviors:</p>
                <div className="flex flex-wrap gap-2">
                  {metrics.topBehaviors.slice(0, 5).map(({ behavior, frequency }) => (
                    <span key={behavior} className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm">
                      {behavior} ({frequency})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Top Triggers */}
            {metrics.topTriggers.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Top Triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {metrics.topTriggers.slice(0, 5). map(({ trigger, frequency }) => (
                    <span key={trigger} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {trigger} ({frequency})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Entries Found</h3>
            <p className="text-gray-600 mb-6">
              No entries match your current filters. Try changing the time period or filters.
            </p>
            <button
              onClick={() => navigate('/growtrack/create')}
              className="px-6 py-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition font-semibold"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Entry Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMoodColor(entry.moodIntensity)}`}>
                      <span className="text-2xl font-bold">{entry.moodIntensity}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{entry.mood}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {entry.trackedPersonType === 'SELF' ?  (
                          <><User className="w-4 h-4" /> Myself</>
                        ) : (
                          <><Users className="w-4 h-4" /> {entry.trackedPersonName}</>
                        )}
                        <span>•</span>
                        <span>{new Date(entry.recordedAt). toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => setDeleteModal(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Behaviors */}
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Behaviors:</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.behaviors.map((behavior, idx) => (
                      <span key={idx} className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm">
                        {behavior}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Triggers */}
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Triggers:</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.triggers.map((trigger, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {entry.notes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{entry.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Entry? </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this entry?  This action cannot be undone. 
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                disabled={deleting}
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

// Helper Component
const MetricCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="text-center">
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default ViewEntries;