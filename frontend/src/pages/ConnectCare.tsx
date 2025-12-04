import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../components/icons/XIcon';
import { LocationMarkerIcon } from '../components/icons/LocationMarkerIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import api from '../config/api';

type ResourceType = 'NGO' | 'COUNSELOR' | 'HELPLINE' | 'SUPPORT_GROUP' | 'HOSPITAL' | 'CLINIC' | 'THERAPIST' | 'PSYCHIATRIST' | 'COMMUNITY_CENTER' | 'ONLINE_SERVICE';

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  excerpt?: string;
  specializations: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location: {
    address?: string;
    city?: string;
    county?: string;
    region?: string;
  };
  operatingHours?: string;
  languages: string[];
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
}

const TypeColors: { [key in ResourceType]: string } = {
  NGO: 'bg-purple-500/20 text-purple-600',
  COUNSELOR: 'bg-teal/20 text-teal',
  HELPLINE: 'bg-blue-500/20 text-blue-600',
  SUPPORT_GROUP: 'bg-pink-500/20 text-pink-600',
  HOSPITAL: 'bg-red-500/20 text-red-600',
  CLINIC: 'bg-green-500/20 text-green-600',
  THERAPIST: 'bg-indigo-500/20 text-indigo-600',
  PSYCHIATRIST: 'bg-orange-500/20 text-orange-600',
  COMMUNITY_CENTER: 'bg-yellow-500/20 text-yellow-600',
  ONLINE_SERVICE: 'bg-cyan-500/20 text-cyan-600',
};

const TypeLabels: { [key in ResourceType]: string } = {
  NGO: 'NGO',
  COUNSELOR: 'Counselor',
  HELPLINE: 'Helpline',
  SUPPORT_GROUP: 'Support Group',
  HOSPITAL: 'Hospital',
  CLINIC: 'Clinic',
  THERAPIST: 'Therapist',
  PSYCHIATRIST: 'Psychiatrist',
  COMMUNITY_CENTER: 'Community Center',
  ONLINE_SERVICE: 'Online Service',
};

const ConnectCare: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResourceType | 'All'>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/directory? limit=100');
      
      if (response.data.success) {
        const directories = response.data.data. directories;
        
        const transformedResources: Resource[] = directories.map((dir: any) => ({
          id: dir.id,
          name: dir.name,
          type: dir.type,
          description: dir.description,
          excerpt: dir.excerpt,
          specializations: dir.specializations || [],
          contact: {
            phone: dir.phone,
            email: dir.email,
            website: dir.website,
          },
          location: {
            address: dir.address,
            city: dir.city,
            county: dir.county,
            region: dir.region,
          },
          operatingHours: dir.operatingHours,
          languages: dir.languages || [],
          tags: dir.tags || [],
          isVerified: dir.isVerified,
          isFeatured: dir.isFeatured,
        }));
        
        transformedResources.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (! a.isFeatured && b.isFeatured) return 1;
          if (a.isVerified && ! b.isVerified) return -1;
          if (!a. isVerified && b.isVerified) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setResources(transformedResources);
      }
    } catch (err: any) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to load resources.  Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources
      .filter(r => activeFilter === 'All' || r.type === activeFilter)
      .filter(r => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          r.name.toLowerCase(). includes(lowercasedTerm) ||
          r.description. toLowerCase().includes(lowercasedTerm) ||
          r. location.city?. toLowerCase().includes(lowercasedTerm) ||
          r. location.county?.toLowerCase().includes(lowercasedTerm) ||
          r.specializations.some(s => s.toLowerCase().includes(lowercasedTerm)) ||
          r.tags.some(t => t.toLowerCase().includes(lowercasedTerm))
        );
      });
  }, [searchTerm, activeFilter, resources]);

  const availableTypes = useMemo(() => {
    const types = new Set(resources.map(r => r. type));
    return Array.from(types).sort();
  }, [resources]);

  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
        body.style.overflow = selectedResource ? 'hidden' : 'auto';
    }
    return () => {
        if(body) body.style.overflow = 'auto';
    };
  }, [selectedResource]);

  const FilterButton: React.FC<{ type: ResourceType | 'All' }> = ({ type }) => (
    <button
      onClick={() => setActiveFilter(type)}
      className={`px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-2 font-bold rounded-full transition-all duration-300 ${
        activeFilter === type
          ? 'bg-teal text-white shadow-md'
          : 'bg-white text-dark-text/80 hover:bg-teal/10'
      }`}
    >
      {type === 'All' ? 'All' : TypeLabels[type as ResourceType]}
    </button>
  );

  if (loading) {
    return (
      <section id="connect-care" className="py-20 bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading resources...</h3>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="connect-care" className="py-20 bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
              <button
                onClick={fetchResources}
                className="mt-4 px-6 py-3 bg-teal text-white rounded-full hover:bg-teal/90 transition-all font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="connect-care" className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-dark-text/80 hover:text-teal font-semibold transition-colors group"
          >
            <svg xmlns="http://www.w3. org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
            Find Support Near You
          </h2>
          <p className="mt-4 text-lg text-dark-text/60 max-w-3xl mx-auto">
            Search our directory of counselors, helplines, and organizations dedicated to children's mental wellness.
          </p>
        </div>

        <div className="mb-10 space-y-6">
          <input
            type="text"
            placeholder="Search by name, specialization, city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-full text-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
          />
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <FilterButton type="All" />
            {availableTypes.map(type => (
              <FilterButton key={type} type={type} />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map(resource => (
            <div
              key={resource.id}
              onClick={() => setSelectedResource(resource)}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 flex flex-col relative"
            >
              {resource.isFeatured && (
                <div className="absolute top-3 left-3">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start mb-4 mt-6">
                <div className="flex-1 pr-2">
                  <h3 className="text-xl font-bold font-heading text-dark-text">
                    {resource.name}
                    {resource.isVerified && (
                      <span className="ml-2 text-blue-500 text-sm">✓</span>
                    )}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${TypeColors[resource.type]}`}>
                  {TypeLabels[resource.type]}
                </span>
              </div>
              <p className="text-dark-text/70 mb-4 text-sm">
                {resource.location.city && resource.location.county 
                  ? `${resource. location.city}, ${resource.location.county}`
                  : resource.location.city || resource.location.county || 'Location not specified'}
              </p>
              <div className="flex-grow">
                <p className="text-dark-text/60 text-sm italic">
                  {resource.excerpt || resource.description. substring(0, 100) + '...'}
                </p>
              </div>
              {resource.specializations.length > 0 && (
                <p className="text-dark-text/60 text-sm italic mt-2">
                  "{resource.specializations.slice(0, 2).join(', ')}{resource.specializations.length > 2 ? '...' : ''}"
                </p>
              )}
              <div className="mt-6 text-center">
                 <span className="font-bold text-teal hover:text-teal/80">View Details &rarr;</span>
              </div>
            </div>
          ))}
           {filteredResources.length === 0 && (
            <p className="text-center text-dark-text/60 md:col-span-2 lg:col-span-3">No resources found.  Try adjusting your search or filters.</p>
          )}
        </div>
      </div>
      
      {/* Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedResource(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <XIcon />
            </button>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-dark-text pr-4">
                  {selectedResource. name}
                  {selectedResource.isVerified && (
                    <span className="ml-2 text-blue-500 text-lg" title="Verified">✓</span>
                  )}
                </h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap mt-1 ${TypeColors[selectedResource. type]}`}>
                  {TypeLabels[selectedResource.type]}
                </span>
            </div>
            
            {selectedResource.isFeatured && (
              <div className="mb-4">
                <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
                  ⭐ Featured Provider
                </span>
              </div>
            )}
            
            <p className="text-dark-text/80 mb-6">{selectedResource.description}</p>
            
            {selectedResource.specializations.length > 0 && (
              <div className="mb-6">
                  <h4 className="font-bold text-dark-text mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                      {selectedResource.specializations.map((spec, idx) => (
                          <span key={idx} className="bg-pastel-green/60 text-dark-text/80 text-sm px-3 py-1 rounded-full">{spec}</span>
                      ))}
                  </div>
              </div>
            )}

            {selectedResource.languages.length > 0 && (
              <div className="mb-6">
                  <h4 className="font-bold text-dark-text mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                      {selectedResource.languages.map((lang, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{lang}</span>
                      ))}
                  </div>
              </div>
            )}

            {selectedResource.tags.length > 0 && (
              <div className="mb-6">
                  <h4 className="font-bold text-dark-text mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                      {selectedResource. tags.map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{tag}</span>
                      ))}
                  </div>
              </div>
            )}

            <div className="space-y-4 text-dark-text/90 bg-light-bg p-4 rounded-lg">
                 {selectedResource.operatingHours && (
                   <p><ClockIcon /> <strong>Hours:</strong> {selectedResource.operatingHours}</p>
                 )}
                 {(selectedResource.location.address || selectedResource.location.city || selectedResource.location.county) && (
                   <p><LocationMarkerIcon /> <strong>Location:</strong> {[selectedResource.location.address, selectedResource.location.city, selectedResource. location.county].filter(Boolean). join(', ')}</p>
                 )}
                 {selectedResource.contact.phone && (
                   <p><PhoneIcon /> <strong>Phone:</strong> <a href={`tel:${selectedResource.contact.phone}`} className="text-teal hover:underline">{selectedResource.contact.phone}</a></p>
                 )}
                 {selectedResource.contact.email && (
                   <p><strong>Email:</strong> <a href={`mailto:${selectedResource. contact.email}`} className="text-teal hover:underline">{selectedResource.contact.email}</a></p>
                 )}
                 {selectedResource.contact.website && (
                   <p><strong>Website:</strong> <a href={selectedResource.contact.website.startsWith('http') ? selectedResource.contact.website : `https://${selectedResource.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">{selectedResource. contact.website}</a></p>
                 )}
            </div>

          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        . animate-fade-in {
          animation: fade-in 0. 3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default ConnectCare;