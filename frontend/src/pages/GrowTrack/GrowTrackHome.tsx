/**
 * ============================================
 * GROWTRACK HOME — DASHBOARD
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, Calendar, Heart, Activity, Shield } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../config/api';
import toast from 'react-hot-toast';

interface QuickStats {
  totalEntries: number;
  averageMoodIntensity: number;
  predominantMood: string;
  trackedChildren: number;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getUserName(): string {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw).name?.split(' ')[0] || 'there';
  } catch {}
  return 'there';
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  accent: string;
}> = ({ icon, label, value, unit, accent }) => (
  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-5 hover:shadow-md transition-shadow">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
      style={{ backgroundColor: accent + '18', color: accent }}
    >
      {icon}
    </div>
    <p className="text-[#1e3a6e]/45 text-xs mb-1">{label}</p>
    <p className="font-heading font-extrabold text-[#1e3a6e] text-xl leading-none">
      {value}{unit && <span className="text-sm font-normal text-[#1e3a6e]/40 ml-1">{unit}</span>}
    </p>
  </div>
);

const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  onClick: () => void;
  primary?: boolean;
}> = ({ title, description, icon, accent, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`group text-left rounded-2xl border transition-all duration-300 p-6 hover:-translate-y-1 hover:shadow-lg ${
      primary
        ? 'bg-[#e9924b] border-[#e9924b] text-white'
        : 'bg-white border-[#1e3a6e]/8 hover:border-[#e9924b]/20'
    }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
        primary ? 'bg-white/20' : ''
      }`}
      style={primary ? {} : { backgroundColor: accent + '18', color: accent }}
    >
      <div className={primary ? 'text-white' : ''}>{icon}</div>
    </div>
    <h3 className={`font-heading font-bold text-base mb-1 ${primary ? 'text-white' : 'text-[#1e3a6e]'}`}>
      {title}
    </h3>
    <p className={`text-sm leading-relaxed ${primary ? 'text-white/70' : 'text-[#1e3a6e]/50'}`}>
      {description}
    </p>
  </button>
);

const FeatureStep: React.FC<{ number: string; title: string; description: string }> = ({
  number, title, description,
}) => (
  <div className="flex gap-5">
    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#e9924b]/10 flex items-center justify-center">
      <span className="font-heading font-extrabold text-[#e9924b] text-sm">{number}</span>
    </div>
    <div>
      <h4 className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">{title}</h4>
      <p className="text-[#1e3a6e]/55 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GrowTrackHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const userName = getUserName();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, childrenRes] = await Promise.all([
          api.get('/growtrack/summary?period=week'),
          api.get('/growtrack/children'),
        ]);
        const s = summaryRes.data.data;
        setStats({
          totalEntries: s.totalEntries || 0,
          averageMoodIntensity: s.averageMoodIntensity || 0,
          predominantMood: s.predominantMood || '—',
          trackedChildren: childrenRes.data.data.count || 0,
        });
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="py-14 md:py-20 bg-[#1e3a6e] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] via-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">GrowTrack</span>
            </div>
            <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-3">
              Welcome back, {userName}
            </h1>
            <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-lg">
              Track moods, observe patterns, and understand what shapes your child's emotional world — one entry at a time.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">

          {/* ── Stats ────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#1e3a6e]/8 p-5 animate-pulse">
                  <div className="w-10 h-10 bg-[#1e3a6e]/8 rounded-xl mb-4" />
                  <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-16 mb-2" />
                  <div className="h-5 bg-[#1e3a6e]/8 rounded-full w-12" />
                </div>
              ))
            ) : stats ? (
              <>
                <StatCard icon={<Calendar className="w-5 h-5" />} label="This week" value={stats.totalEntries} unit="entries" accent="#659ec3" />
                <StatCard icon={<Heart className="w-5 h-5" />} label="Avg mood" value={stats.averageMoodIntensity.toFixed(1)} unit="/ 10" accent="#e9924b" />
                <StatCard icon={<Activity className="w-5 h-5" />} label="Most common" value={stats.predominantMood} accent="#1e3a6e" />
                <StatCard icon={<Users className="w-5 h-5" />} label="Children" value={stats.trackedChildren} unit="tracked" accent="#659ec3" />
              </>
            ) : null}
          </div>

          {/* ── Actions ──────────────────────────────── */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Quick Actions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard
                title="New Entry"
                description="Record a mood, behavior, and trigger"
                icon={<Plus className="w-5 h-5" />}
                accent="#e9924b"
                onClick={() => navigate('/growtrack/create')}
                primary
              />
              <ActionCard
                title="View History"
                description="Browse and filter past entries"
                icon={<Calendar className="w-5 h-5" />}
                accent="#659ec3"
                onClick={() => navigate('/growtrack/entries')}
              />
              <ActionCard
                title="AI Insights"
                description="Patterns, trends, and coping strategies"
                icon={<TrendingUp className="w-5 h-5" />}
                accent="#1e3a6e"
                onClick={() => navigate('/growtrack/insights')}
              />
              <ActionCard
                title="Manage Children"
                description="Add or update child profiles"
                icon={<Users className="w-5 h-5" />}
                accent="#659ec3"
                onClick={() => navigate('/growtrack/children')}
              />
            </div>
          </div>

          {/* ── How it works ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#e9924b]" />
                <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">How it works</span>
              </div>
              <div className="space-y-5">
                <FeatureStep number="1" title="Record daily" description="Log moods, behaviors observed, and what triggered them — for yourself or your child." />
                <FeatureStep number="2" title="See patterns" description="Browse entries over time to notice what's consistent and what's changing." />
                <FeatureStep number="3" title="Get AI insights" description="Receive personalized coping strategies based on your actual data — not generic advice." />
              </div>
            </div>

            {/* Privacy notice */}
            <div className="bg-[#1e3a6e] rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-extrabold text-white text-lg mb-3">Your data stays private</h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  All tracking data is encrypted and private. Only AI-summarized insights are generated — raw entries are never shared or logged externally.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/25 text-xs">GrowTrack — part of the Totoz Wellness ecosystem</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GrowTrackHome;