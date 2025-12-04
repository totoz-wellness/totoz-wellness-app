/**
 * ============================================
 * GROWTRACK HOME - Dashboard Overview
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, Calendar, Heart } from 'lucide-react';
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

const GrowTrackHome: React. FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const [summaryRes, childrenRes] = await Promise.all([
        api.get('/growtrack/summary? period=week'),
        api.get('/growtrack/children')
      ]);

      setStats({
        totalEntries: summaryRes.data.data.totalEntries || 0,
        averageMoodIntensity: summaryRes.data.data.averageMoodIntensity || 0,
        predominantMood: summaryRes.data.data.predominantMood || 'N/A',
        trackedChildren: childrenRes.data.data.count || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            GrowTrack 🌱
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track moods, behaviors, and triggers for yourself and your children. 
            Get AI-powered insights to support emotional well-being.
          </p>
        </div>

        {/* Quick Stats */}
        {! loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="This Week"
              value={`${stats.totalEntries} entries`}
              color="bg-blue-500"
            />
            <StatCard
              icon={<Heart className="w-6 h-6" />}
              label="Avg Mood"
              value={`${stats.averageMoodIntensity}/10`}
              color="bg-pink-500"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Most Common"
              value={stats.predominantMood}
              color="bg-teal"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Children Tracked"
              value={stats. trackedChildren. toString()}
              color="bg-purple-500"
            />
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <ActionCard
            title="New Entry"
            description="Record a mood, behavior, and trigger entry"
            icon={<Plus className="w-8 h-8" />}
            color="bg-teal"
            onClick={() => navigate('/growtrack/create')}
          />
          <ActionCard
            title="View Entries"
            description="Browse and filter your tracking history"
            icon={<Calendar className="w-8 h-8" />}
            color="bg-blue-500"
            onClick={() => navigate('/growtrack/entries')}
          />
          <ActionCard
            title="AI Insights"
            description="Get personalized coping strategies"
            icon={<TrendingUp className="w-8 h-8" />}
            color="bg-purple-500"
            onClick={() => navigate('/growtrack/insights')}
          />
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How GrowTrack Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              step="1"
              title="Track Daily"
              description="Record moods, behaviors, and triggers for yourself or your children"
            />
            <Feature
              step="2"
              title="Identify Patterns"
              description="View trends over time to understand emotional and behavioral patterns"
            />
            <Feature
              step="3"
              title="Get Insights"
              description="Receive AI-powered coping strategies tailored to your specific triggers"
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-teal/10 border-2 border-teal rounded-xl p-6 text-center">
          <p className="text-gray-700 font-semibold mb-2">
            🔒 Your Privacy is Protected
          </p>
          <p className="text-gray-600 text-sm">
            All tracking data is private and encrypted. Only AI-summarized insights
            are generated—raw mood entries are never logged or shared.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <p className="text-gray-600 text-sm mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ActionCard: React. FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}> = ({ title, description, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 text-left group"
  >
    <div className={`${color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </button>
);

const Feature: React.FC<{
  step: string;
  title: string;
  description: string;
}> = ({ step, title, description }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-teal text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
      {step}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default GrowTrackHome;