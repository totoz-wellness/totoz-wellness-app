/**
 * ============================================
 * GROWTRACK — AI INSIGHTS
 * ============================================
 * @version     3.1.0
 * @updated     2025-04-23
 * @fix         Null safety on all metrics fields to prevent white-screen crashes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, TrendingUp, Lightbulb,
  Calendar, Users, Download, RefreshCw,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../config/api';
import toast from 'react-hot-toast';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface InsightsData {
  period: string;
  dateRange: { start: string; end: string };
  totalEntries: number;
  metrics: {
    averageMoodIntensity: number;
    predominantMood: string;
    moodTrend: string;
    moodVariety: number;
    topBehaviors: Array<{ behavior: string; frequency: number }>;
    topTriggers: Array<{ trigger: string; frequency: number }>;
  };
  insights: string;
  trackedPerson: { type: string; name: string | null };
  generatedAt: string;
}

// ─── SAFE COERCIONS ───────────────────────────────────────────────────────────

function safe(val: unknown, fallback = '—'): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s === '' ? fallback : s;
}

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return isFinite(n) ? n : fallback;
}

function normaliseData(raw: any): InsightsData {
  const m = raw?.metrics ?? {};
  return {
    period:       raw?.period       ?? '',
    dateRange:    raw?.dateRange    ?? { start: '—', end: '—' },
    totalEntries: safeNum(raw?.totalEntries),
    metrics: {
      averageMoodIntensity: safeNum(m?.averageMoodIntensity),
      predominantMood:      safe(m?.predominantMood, 'Unknown'),
      moodTrend:            safe(m?.moodTrend, 'INSUFFICIENT_DATA'),
      moodVariety:          safeNum(m?.moodVariety),
      topBehaviors:         Array.isArray(m?.topBehaviors) ? m.topBehaviors : [],
      topTriggers:          Array.isArray(m?.topTriggers)  ? m.topTriggers  : [],
    },
    insights:      safe(raw?.insights, ''),
    trackedPerson: raw?.trackedPerson ?? { type: 'ALL', name: null },
    generatedAt:   raw?.generatedAt  ?? new Date().toISOString(),
  };
}

// ─── TREND CONFIG ─────────────────────────────────────────────────────────────

const TREND_CONFIG = {
  IMPROVING:         { label: 'Improving',       accent: '#659ec3', bg: 'bg-[#659ec3]/8',  border: 'border-[#659ec3]/20', description: 'Mood intensity is trending upward' },
  STABLE:            { label: 'Stable',          accent: '#1e3a6e', bg: 'bg-[#1e3a6e]/6',  border: 'border-[#1e3a6e]/15', description: 'Mood remains consistent' },
  DECLINING:         { label: 'Declining',       accent: '#e9924b', bg: 'bg-[#e9924b]/8',  border: 'border-[#e9924b]/20', description: 'Mood intensity is trending downward' },
  INSUFFICIENT_DATA: { label: 'Not enough data', accent: '#1e3a6e', bg: 'bg-[#1e3a6e]/4',  border: 'border-[#1e3a6e]/10', description: 'More entries needed for trend analysis' },
};

const getTrend = (t: string) =>
  TREND_CONFIG[t as keyof typeof TREND_CONFIG] ?? TREND_CONFIG.INSUFFICIENT_DATA;

// ─── STYLES ───────────────────────────────────────────────────────────────────

const selectClass =
  'w-full px-4 py-2.5 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] text-sm focus:outline-none focus:border-[#e9924b]/50 transition-all';

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  label: string; value: string; accent: string; icon: React.ReactNode;
}> = ({ label, value, accent, icon }) => (
  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
      style={{ backgroundColor: accent + '18', color: accent }}>
      {icon}
    </div>
    <p className="text-[#1e3a6e]/40 text-xs mb-1">{label}</p>
    <p className="font-heading font-extrabold text-[#1e3a6e] text-base leading-tight">{value}</p>
  </div>
);

// ─── BAR ROW ─────────────────────────────────────────────────────────────────

const BarRow: React.FC<{
  label: string; count: number; max: number; rank: number; accent: string;
}> = ({ label, count, max, rank, accent }) => (
  <div className="flex items-center gap-4">
    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
      style={{ backgroundColor: accent + '18', color: accent }}>
      {rank}
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#1e3a6e]/75 text-sm font-medium truncate">{label}</span>
        <span className="text-[#1e3a6e]/35 text-xs ml-3 flex-shrink-0">{count}x</span>
      </div>
      <div className="h-1.5 bg-[#1e3a6e]/6 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: max > 0 ? `${(count / max) * 100}%` : '0%', backgroundColor: accent }} />
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const Insights: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<InsightsData | null>(null);
  const [children, setChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [personType, setPersonType] = useState<'ALL' | 'SELF' | 'CHILD'>('ALL');
  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    api.get('/growtrack/children')
      .then(r => setChildren(r.data?.data?.children ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchInsights(); }, [period, personType, selectedChild]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ period });
      if (personType !== 'ALL') p.append('trackedPersonType', personType);
      if (selectedChild) p.append('trackedPersonName', selectedChild);
      const r = await api.get(`/growtrack/insights?${p.toString()}`);
      // Handle both response shapes: r.data.data or r.data
      const raw = r.data?.data ?? r.data ?? {};
      setData(normaliseData(raw));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load insights');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const lines = [
      'GROWTRACK INSIGHTS REPORT',
      `Generated: ${new Date(data.generatedAt).toLocaleString()}`,
      `Period: ${period.toUpperCase()} | Tracking: ${data.trackedPerson.type === 'SELF' ? 'Myself' : (data.trackedPerson.name ?? 'All')}`,
      '',
      '--- SUMMARY ---',
      `Total Entries: ${data.totalEntries}`,
      `Average Mood: ${data.metrics.averageMoodIntensity}/10`,
      `Predominant Mood: ${data.metrics.predominantMood}`,
      `Mood Trend: ${data.metrics.moodTrend}`,
      `Mood Variety: ${data.metrics.moodVariety} moods`,
      '',
      '--- TOP BEHAVIORS ---',
      ...data.metrics.topBehaviors.map((b, i) => `${i + 1}. ${b.behavior} (${b.frequency}x)`),
      '',
      '--- TOP TRIGGERS ---',
      ...data.metrics.topTriggers.map((t, i) => `${i + 1}. ${t.trigger} (${t.frequency}x)`),
      '',
      '--- AI INSIGHTS ---',
      data.insights || '(no insights generated)',
      '',
      'Generated by GrowTrack — Totoz Wellness',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `growtrack-insights-${period}-${Date.now()}.txt`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const hasData = data !== null && data.totalEntries > 0;

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <div className="bg-[#1e3a6e] py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
            <button onClick={() => navigate('/growtrack')}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to GrowTrack
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-[#e9924b]" />
                  <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">AI Insights</span>
                </div>
                <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl">Personalized analysis</h1>
                <p className="text-white/45 text-sm mt-1">Patterns, trends, and coping strategies from your data</p>
              </div>
              {hasData && (
                <button onClick={handleExport}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-all">
                  <Download className="w-4 h-4" />
                  Export report
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-10">

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6 mb-8">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/40 mb-4">Filter</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e3a6e]/60 mb-1.5">Time period</label>
                <select value={period} onChange={e => setPeriod(e.target.value as any)} className={selectClass}>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="year">Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1e3a6e]/60 mb-1.5">Who to analyze</label>
                <select value={personType} onChange={e => {
                  setPersonType(e.target.value as any);
                  if (e.target.value !== 'CHILD') setSelectedChild('');
                }} className={selectClass}>
                  <option value="ALL">Everyone</option>
                  <option value="SELF">Myself</option>
                  <option value="CHILD">Children</option>
                </select>
              </div>
              {personType === 'CHILD' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1e3a6e]/60 mb-1.5">Select child</label>
                  <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className={selectClass}>
                    <option value="">All children</option>
                    {children.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
            <button onClick={fetchInsights} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh insights
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-[#e9924b]/30 border-t-[#e9924b] rounded-full animate-spin mb-5" />
              <p className="font-heading font-bold text-[#1e3a6e] text-sm">Generating insights...</p>
              <p className="text-[#1e3a6e]/40 text-xs mt-1">This may take a few moments</p>
            </div>

          ) : !hasData ? (
            <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a6e]/6 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-[#1e3a6e]/30" />
              </div>
              <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1">No data available</p>
              <p className="text-[#1e3a6e]/45 text-sm mb-8">
                Create some entries first to start generating insights.
              </p>
              <button onClick={() => navigate('/growtrack/create')}
                className="px-6 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-full hover:bg-[#d4762a] transition-all">
                Create entry
              </button>
            </div>

          ) : (
            <div className="space-y-6">
              {/* Metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Total entries" value={safe(data!.totalEntries, '0')} accent="#659ec3" icon={<Calendar className="w-4 h-4" />} />
                <MetricCard label="Avg mood" value={`${safeNum(data!.metrics.averageMoodIntensity).toFixed(1)}/10`} accent="#e9924b" icon={<TrendingUp className="w-4 h-4" />} />
                <MetricCard label="Most common" value={safe(data!.metrics.predominantMood)} accent="#1e3a6e" icon={<Brain className="w-4 h-4" />} />
                <MetricCard label="Mood variety" value={`${safe(data!.metrics.moodVariety, '0')} moods`} accent="#659ec3" icon={<Lightbulb className="w-4 h-4" />} />
              </div>

              {/* Trend */}
              {(() => {
                const t = getTrend(data!.metrics.moodTrend);
                return (
                  <div className={`rounded-2xl border p-6 ${t.bg} ${t.border}`}>
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: t.accent }}>Mood trend</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.accent + '20' }}>
                        <TrendingUp className="w-5 h-5" style={{ color: t.accent }} />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-[#1e3a6e] text-base">{t.label}</p>
                        <p className="text-[#1e3a6e]/55 text-sm">{t.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Behaviors + Triggers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data!.metrics.topBehaviors.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#659ec3] mb-5">Top behaviors</p>
                    <div className="space-y-4">
                      {data!.metrics.topBehaviors.map((b, i) => (
                        <BarRow key={b.behavior ?? i} label={safe(b.behavior)} count={safeNum(b.frequency)}
                          max={safeNum(data!.metrics.topBehaviors[0]?.frequency, 1)} rank={i + 1} accent="#659ec3" />
                      ))}
                    </div>
                  </div>
                )}
                {data!.metrics.topTriggers.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#e9924b] mb-5">Top triggers</p>
                    <div className="space-y-4">
                      {data!.metrics.topTriggers.map((t, i) => (
                        <BarRow key={t.trigger ?? i} label={safe(t.trigger)} count={safeNum(t.frequency)}
                          max={safeNum(data!.metrics.topTriggers[0]?.frequency, 1)} rank={i + 1} accent="#e9924b" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Insights */}
              <div className="bg-[#1e3a6e] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#e9924b]/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-[#e9924b]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#e9924b]">AI-generated insights</p>
                    <p className="text-white/45 text-xs mt-0.5">
                      For {data!.trackedPerson.type === 'SELF' ? 'you' : (data!.trackedPerson.name ?? 'everyone')}
                    </p>
                  </div>
                </div>
                {data!.insights ? (
                  <div className="bg-white/6 rounded-xl p-6 space-y-3">
                    {data!.insights.split('\n').filter(p => p.trim()).map((p, i) => (
                      <p key={i} className="text-white/70 text-sm leading-[1.85]">{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">No insights generated for this period.</p>
                )}
                <p className="text-white/25 text-xs mt-5 leading-relaxed">
                  AI-generated from your tracking data — not a substitute for professional mental health advice.
                </p>
              </div>

              {/* Report footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm px-6 py-4">
                <p className="text-[#1e3a6e]/35 text-xs">
                  Generated {new Date(data!.generatedAt).toLocaleString()}
                  {' · '}{safe(data!.dateRange?.start)} to {safe(data!.dateRange?.end)}
                </p>
                <button onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e3a6e] text-white text-xs font-semibold rounded-xl hover:bg-[#1e3a6e]/90 transition-all md:hidden">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Insights;