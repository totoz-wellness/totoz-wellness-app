/**
 * ============================================
 * GROWTRACK HOME - Dashboard Overview
 * ============================================
 * @version     2.0.0
 * @author      ArogoClin
 * @updated     2025-12-05
 * @description Clean, simple mood tracking dashboard
 * ============================================
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

const GrowTrackHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDashboardData();
    loadUserName();
  }, []);

  const loadUserName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name?. split(' ')[0] || 'there');
      }
    } catch (error) {
      console. error('Failed to load user name:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [summaryRes, childrenRes] = await Promise.all([
        api.get('/growtrack/summary? period=week'),
        api.get('/growtrack/children')
      ]);

      const summaryData = summaryRes.data. data;
      
      setStats({
        totalEntries: summaryData.totalEntries || 0,
        averageMoodIntensity: summaryData.averageMoodIntensity || 0,
        predominantMood: summaryData.predominantMood || 'Not enough data',
        trackedChildren: childrenRes.data.data. count || 0
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mt-12 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Welcome back, {userName}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track moods, behaviors, and triggers to support emotional well-being
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[... Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="This Week"
              value={stats. totalEntries}
              unit="entries"
              color="bg-blue-500"
            />
            <StatCard
              icon={<Heart className="w-6 h-6" />}
              label="Average Mood"
              value={stats.averageMoodIntensity. toFixed(1)}
              unit="/ 10"
              color="bg-pink-500"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="Most Common"
              value={stats.predominantMood}
              color="bg-teal"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Children"
              value={stats.trackedChildren}
              unit="tracked"
              color="bg-purple-500"
            />
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ActionCard
            title="New Entry"
            description="Record mood and triggers"
            icon={<Plus className="w-7 h-7" />}
            color="bg-teal"
            onClick={() => navigate('/growtrack/create')}
          />
          <ActionCard
            title="View History"
            description="Browse past entries"
            icon={<Calendar className="w-7 h-7" />}
            color="bg-blue-500"
            onClick={() => navigate('/growtrack/entries')}
          />
          <ActionCard
            title="AI Insights"
            description="Get coping strategies"
            icon={<TrendingUp className="w-7 h-7" />}
            color="bg-purple-500"
            onClick={() => navigate('/growtrack/insights')}
          />
          <ActionCard
            title="Manage Children"
            description="Add or edit profiles"
            icon={<Users className="w-7 h-7" />}
            color="bg-amber-500"
            onClick={() => navigate('/growtrack/children')}
          />
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How GrowTrack Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureStep
              number="1"
              title="Track Daily"
              description="Record moods, behaviors, and triggers for yourself or your children"
            />
            <FeatureStep
              number="2"
              title="Identify Patterns"
              description="View trends over time to understand emotional patterns"
            />
            <FeatureStep
              number="3"
              title="Get Insights"
              description="Receive AI-powered coping strategies tailored to your triggers"
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-teal/10 border-2 border-teal/30 rounded-xl p-6">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Your Privacy is Protected
              </h3>
              <p className="text-gray-700 leading-relaxed">
                All tracking data is private and encrypted. Only AI-summarized insights
                are generated.  Raw mood entries are never logged or shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ========== COMPONENTS ==========

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, unit, color }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <p className="text-gray-600 text-sm mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">
      {value} {unit && <span className="text-sm font-normal text-gray-500">{unit}</span>}
    </p>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left group"
  >
    <div className={`${color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </button>
);

interface FeatureStepProps {
  number: string;
  title: string;
  description: string;
}

const FeatureStep: React.FC<FeatureStepProps> = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-teal text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default GrowTrackHome;