import React, { useState, useEffect } from 'react';
import api from '../../config/api';

interface Directory {
  id: string;
  name: string;
  type: string;
  description: string;
  excerpt?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  county?: string;
  region?: string;
  coordinates?: string;
  operatingHours?: string;
  languages: string[];
  specializations: string[];
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
  slug: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ConnectCareAdminProps {
  onBack: () => void;
}

const DIRECTORY_TYPES = [
  { value: 'NGO', label: 'NGO' },
  { value: 'COUNSELOR', label: 'Counselor' },
  { value: 'HELPLINE', label: 'Helpline' },
  { value: 'SUPPORT_GROUP', label: 'Support Group' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'THERAPIST', label: 'Therapist' },
  { value: 'PSYCHIATRIST', label: 'Psychiatrist' },
  { value: 'COMMUNITY_CENTER', label: 'Community Center' },
  { value: 'ONLINE_SERVICE', label: 'Online Service' }
];

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Meru', 'Embu',
  'Kitui', 'Garissa', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira'
];

const ConnectCareAdmin: React.FC<ConnectCareAdminProps> = ({ onBack }) => {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDirectory, setEditingDirectory] = useState<Directory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCounty, setFilterCounty] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'NGO',
    description: '',
    excerpt: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    county: '',
    region: '',
    coordinates: '',
    operatingHours: '',
    languages: '',
    specializations: '',
    tags: '',
    isVerified: false,
    isFeatured: false
  });

  useEffect(() => {
    fetchDirectories();
  }, [filterType, filterCounty]);

  const fetchDirectories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = '/directory?limit=100';
      if (filterType) url += `&type=${filterType}`;
      if (filterCounty) url += `&county=${filterCounty}`;

      const response = await api.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDirectories(response.data.data.directories);
      }
    } catch (err: any) {
      console.error('Failed to fetch directories:', err);
      setError(err.response?.data?.message || 'Failed to load directories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const payload = {
        ...formData,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()) : [],
        specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()) : [],
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : []
      };

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editingDirectory) {
        await api.put(`/directory/${editingDirectory.id}`, payload, config);
      } else {
        await api.post('/directory', payload, config);
      }

      setShowModal(false);
      resetForm();
      fetchDirectories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save directory entry');
    }
  };

  const handleEdit = (directory: Directory) => {
    setEditingDirectory(directory);
    setFormData({
      name: directory.name,
      type: directory.type,
      description: directory.description,
      excerpt: directory.excerpt || '',
      phone: directory.phone || '',
      email: directory.email || '',
      website: directory.website || '',
      address: directory.address || '',
      city: directory.city || '',
      county: directory.county || '',
      region: directory.region || '',
      coordinates: directory.coordinates || '',
      operatingHours: directory.operatingHours || '',
      languages: directory.languages.join(', '),
      specializations: directory.specializations.join(', '),
      tags: directory.tags.join(', '),
      isVerified: directory.isVerified,
      isFeatured: directory.isFeatured
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this directory entry?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/directory/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDirectories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete directory entry');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'NGO',
      description: '',
      excerpt: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      county: '',
      region: '',
      coordinates: '',
      operatingHours: '',
      languages: '',
      specializations: '',
      tags: '',
      isVerified: false,
      isFeatured: false
    });
    setEditingDirectory(null);
  };

  const filteredDirectories = directories.filter(dir =>
    dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dir.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dir.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
          <h3 className="mt-4 text-xl font-semibold text-dark-text">Loading Directory...</h3>
          <p className="mt-2 text-dark-text/60">Fetching entries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <button 
                onClick={onBack} 
                className="text-teal hover:text-teal/80 mb-3 flex items-center transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-[#347EAD] to-teal p-2 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
                  ConnectCare Directory
                </h1>
              </div>
              <p className="text-lg text-dark-text/70">
                Manage healthcare facilities and support services
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-teal text-white px-6 py-3 rounded-full hover:bg-teal/90 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Entry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-bold text-dark-text">Filter & Search</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-text/80 mb-2">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, description, city..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-text/80 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">All Types</option>
                {DIRECTORY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-text/80 mb-2">County</label>
              <select
                value={filterCounty}
                onChange={(e) => setFilterCounty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">All Counties</option>
                {KENYAN_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Directory List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-text">
                Directory Entries
              </h2>
              <span className="bg-teal/10 text-teal px-4 py-2 rounded-full text-sm font-semibold">
                {filteredDirectories.length} {filteredDirectories.length === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredDirectories.length > 0 ? (
              filteredDirectories.map((directory) => (
                <div key={directory.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-dark-text">{directory.name}</h3>
                        {directory.isVerified && (
                          <span className="inline-flex items-center gap-1 bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verified
                          </span>
                        )}
                        {directory.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-[#F09232]/10 text-[#F09232] px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-text/70 mb-3">
                        <span className="inline-flex items-center gap-1 font-medium text-[#347EAD]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {DIRECTORY_TYPES.find(t => t.value === directory.type)?.label}
                        </span>
                        {directory.city && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {directory.city}
                          </span>
                        )}
                        {directory.county && <span>{directory.county}</span>}
                      </div>
                      
                      <p className="text-dark-text/80 mb-3 leading-relaxed">
                        {directory.excerpt || directory.description.substring(0, 150)}...
                      </p>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-dark-text/70">
                        {directory.phone && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {directory.phone}
                          </span>
                        )}
                        {directory.email && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {directory.email}
                          </span>
                        )}
                        {directory.website && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            {directory.website}
                          </span>
                        )}
                      </div>
                      
                      {directory.specializations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {directory.specializations.map((spec, idx) => (
                            <span key={idx} className="bg-gray-100 text-dark-text/70 px-3 py-1 rounded-full text-xs font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex lg:flex-col gap-2 lg:min-w-[120px]">
                      <button
                        onClick={() => handleEdit(directory)}
                        className="flex-1 lg:flex-none bg-[#347EAD] text-white px-4 py-2 rounded-lg hover:bg-[#347EAD]/90 transition-all font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(directory.id)}
                        className="flex-1 lg:flex-none bg-white text-red-600 border-2 border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-dark-text mb-2">No Entries Found</h3>
                <p className="text-dark-text/60 mb-4">Try adjusting your filters or add a new directory entry</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="inline-flex items-center gap-2 bg-teal text-white px-6 py-3 rounded-full hover:bg-teal/90 transition-all font-semibold shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-teal to-[#347EAD]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingDirectory ? 'Edit Directory Entry' : 'Add New Directory Entry'}
                  </h2>
                </div>
                <button 
                  onClick={() => { setShowModal(false); resetForm(); }} 
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Enter facility or service name"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all appearance-none bg-white"
                  >
                    {DIRECTORY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* County */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">County</label>
                  <select
                    value={formData.county}
                    onChange={(e) => setFormData({...formData, county: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Select County</option>
                    {KENYAN_COUNTIES.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Enter city"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="contact@example.com"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark-text mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Enter full address"
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Excerpt
                    <span className="text-dark-text/60 font-normal ml-2">(Brief description)</span>
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Short summary (1-2 sentences)"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Provide detailed description of services, facilities, etc."
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="e.g., Mon-Fri 8AM-5PM"
                  />
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Languages
                    <span className="text-dark-text/60 font-normal ml-2">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="e.g., English, Swahili, Kikuyu"
                  />
                </div>

                {/* Specializations */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Specializations
                    <span className="text-dark-text/60 font-normal ml-2">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specializations}
                    onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="e.g., Cardiology, Pediatrics, Mental Health"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    Tags
                    <span className="text-dark-text/60 font-normal ml-2">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="e.g., 24/7, Emergency, Insurance Accepted"
                  />
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                      className="w-5 h-5 text-teal border-gray-300 rounded focus:ring-teal transition-all"
                    />
                    <span className="text-sm font-semibold text-dark-text group-hover:text-teal transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-5 h-5 text-[#F09232] border-gray-300 rounded focus:ring-[#F09232] transition-all"
                    />
                    <span className="text-sm font-semibold text-dark-text group-hover:text-[#F09232] transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-dark-text rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal/90 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingDirectory ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectCareAdmin;