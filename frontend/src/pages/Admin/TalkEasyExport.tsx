import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { getCurrentUser, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';

interface TrainingStats {
  totalRecords: number;
  qualityDistribution: Array<{ quality_tier: string; count: bigint }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  readyForTraining: boolean;
}

interface TalkEasyExportProps {
  onBack: () => void;
  onLogout: () => void;
}

const TalkEasyExport: React.FC<TalkEasyExportProps> = ({ onBack, onLogout }) => {
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'jsonl' | 'csv'>('json'); // 🆕 Added CSV
  const [minQuality, setMinQuality] = useState('0.6');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchTrainingStats();
  }, []);

  const fetchTrainingStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/talkeasy/admin/training-stats');
      
      if (response.data.success) {
        const stats = response.data.data;
        if (stats.qualityDistribution) {
          stats.qualityDistribution = stats.qualityDistribution.map((item: any) => ({
            ...item,
            count: Number(item.count)
          }));
        }
        setTrainingStats(stats);
      } else {
        throw new Error(response.data.message || 'Failed to fetch training stats');
      }
    } catch (err: any) {
      console.error('Failed to fetch training stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load training statistics');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Convert JSON to CSV
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const csvHeader = headers.join(',');
    
    // Create CSV data rows
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        // Handle arrays
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [csvHeader, ...csvRows].join('\n');
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      setError(null);
      setExportSuccess(null);
      
      const response = await api.get(`/talkeasy/admin/export-training-data?minQuality=${minQuality}&format=${exportFormat === 'csv' ? 'json' : exportFormat}`, {
        responseType: exportFormat === 'jsonl' ? 'blob' : 'json'
      });

      if (exportFormat === 'jsonl') {
        // Download as JSONL file
        const blob = new Blob([response.data], { type: 'application/jsonlines' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `talkeasy-training-data-${new Date().toISOString().split('T')[0]}.jsonl`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setExportSuccess(`Successfully exported training data as JSONL file`);
      } else if (exportFormat === 'csv') {
        // 🆕 Handle CSV export
        if (response.data.success) {
          const csvData = convertToCSV(response.data.data);
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `talkeasy-training-data-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setExportSuccess(`Successfully exported ${response.data.count} training records as CSV`);
        } else {
          throw new Error(response.data.message || 'Export failed');
        }
      } else {
        // Handle JSON export
        if (response.data.success) {
          const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `talkeasy-training-data-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setExportSuccess(`Successfully exported ${response.data.count} training records as JSON`);
        } else {
          throw new Error(response.data.message || 'Export failed');
        }
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to export training data');
    } finally {
      setExporting(false);
    }
  };

  const handleManualCleanup = async () => {
    if (!confirm('Are you sure you want to run database cleanup? This will delete old messages according to retention policies.')) {
      return;
    }

    try {
      setExporting(true);
      setError(null);
      setExportSuccess(null);
      
      const response = await api.post('/talkeasy/admin/cleanup');
      
      if (response.data.success) {
        setExportSuccess(response.data.message);
      } else {
        throw new Error(response.data.message || 'Cleanup failed');
      }
    } catch (err: any) {
      console.error('Cleanup failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to run cleanup');
    } finally {
      setExporting(false);
    }
  };

  const handleAggregateAnalytics = async () => {
    try {
      setExporting(true);
      setError(null);
      setExportSuccess(null);
      
      const response = await api.post('/talkeasy/admin/aggregate-analytics');
      
      if (response.data.success) {
        setExportSuccess(response.data.message);
      } else {
        throw new Error(response.data.message || 'Aggregation failed');
      }
    } catch (err: any) {
      console.error('Aggregation failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to aggregate analytics');
    } finally {
      setExporting(false);
    }
  };

  const getQualityColor = (tier: string): string => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      fair: 'bg-yellow-500',
      poor: 'bg-red-500',
    };
    return colors[tier] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
          <h3 className="mt-4 text-xl font-semibold text-dark-text">Loading Export Tools...</h3>
        </div>
      </div>
    );
  }

  if (error && !trainingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="bg-white border-2 border-red-300 rounded-xl p-8 max-w-md shadow-lg">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-red-800">Error Loading Export Tools</h3>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchTrainingStats}
              className="flex-1 px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
                    TalkEasy Data Export
                  </h1>
                  <p className="text-lg text-dark-text/70 mt-1">
                    Export Training Data & System Maintenance
                  </p>
                </div>
              </div>
              {currentUser && (
                <div className="ml-14 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getRoleColor(currentUser.role)}-100 text-${getRoleColor(currentUser.role)}-800 border border-${getRoleColor(currentUser.role)}-200`}>
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-sm text-dark-text/60">{currentUser.name}</span>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-6 py-3 bg-teal text-white rounded-full hover:bg-teal/90 transition-all font-medium shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {exportSuccess && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">{exportSuccess}</p>
            </div>
          </div>
        )}

        {error && trainingStats && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Training Data Stats */}
        {trainingStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Overview Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Training Data Overview
              </h3>
              
              <div className="space-y-4">
                <div className="bg-teal/5 rounded-lg p-4">
                  <div className="text-sm text-dark-text/60 mb-1">Total Training Records</div>
                  <div className="text-3xl font-bold text-teal">{trainingStats.totalRecords.toLocaleString()}</div>
                </div>

                <div className={`${trainingStats.readyForTraining ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border-2 rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    {trainingStats.readyForTraining ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className={`font-semibold ${trainingStats.readyForTraining ? 'text-green-800' : 'text-orange-800'}`}>
                      {trainingStats.readyForTraining ? 'Ready for Training' : 'Not Ready Yet'}
                    </span>
                  </div>
                  <p className={`text-sm ${trainingStats.readyForTraining ? 'text-green-700' : 'text-orange-700'}`}>
                    {trainingStats.readyForTraining 
                      ? 'Dataset has sufficient high-quality records for AI model training'
                      : 'Minimum 1,000 records required for optimal training results'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Distribution */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6z" />
                </svg>
                Quality Distribution
              </h3>

              <div className="space-y-3">
                {trainingStats.qualityDistribution.map((tier: any) => {
                  const total = trainingStats.qualityDistribution.reduce((sum: number, t: any) => sum + Number(t.count), 0);
                  const percentage = total > 0 ? ((Number(tier.count) / total) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <div key={tier.quality_tier} className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${getQualityColor(tier.quality_tier)} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {Number(tier.count)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-dark-text capitalize">{tier.quality_tier}</span>
                          <span className="text-sm text-dark-text/60">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${getQualityColor(tier.quality_tier)} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {trainingStats && trainingStats.categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#347EAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Category Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trainingStats.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="bg-[#347EAD]/5 rounded-lg p-4 border border-[#347EAD]/20">
                  <div className="text-2xl font-bold text-[#347EAD]">{cat.count}</div>
                  <div className="text-sm text-dark-text/70 mt-1">{cat.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Training Data
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Minimum Quality Score
              </label>
              <select
                value={minQuality}
                onChange={(e) => setMinQuality(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
                disabled={exporting}
              >
                <option value="0.8">Excellent (0.8+)</option>
                <option value="0.6">Good (0.6+)</option>
                <option value="0.4">Fair (0.4+)</option>
                <option value="0.0">All Quality Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'jsonl' | 'csv')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
                disabled={exporting}
              >
                <option value="json">JSON (Standard)</option>
                <option value="jsonl">JSONL (Line-delimited)</option>
                <option value="csv">CSV (Spreadsheet)</option> {/* 🆕 CSV Option */}
              </select>
              <p className="mt-2 text-xs text-dark-text/60">
                {exportFormat === 'csv' && '📊 CSV format is ideal for Excel/Google Sheets analysis'}
                {exportFormat === 'json' && '📄 JSON format is ideal for programming/AI training'}
                {exportFormat === 'jsonl' && '📝 JSONL format is ideal for large-scale ML pipelines'}
              </p>
            </div>
          </div>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full bg-teal text-white px-6 py-4 rounded-lg font-semibold hover:bg-teal/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Training Dataset ({exportFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>

        {/* System Maintenance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            System Maintenance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleManualCleanup}
              disabled={exporting}
              className="bg-orange-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Run Database Cleanup</span>
            </button>

            <button
              onClick={handleAggregateAnalytics}
              disabled={exporting}
              className="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6z" />
              </svg>
              <span>Aggregate Analytics</span>
            </button>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Maintenance Actions</p>
                <p className="text-xs text-yellow-700 mt-1">
                  These actions are automated but can be run manually if needed. Cleanup runs daily, analytics aggregate every 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalkEasyExport;