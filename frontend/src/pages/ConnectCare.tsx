import React, { useState, useMemo, useEffect } from 'react';
import { XIcon } from '../components/icons/XIcon';
import { LocationMarkerIcon } from '../components/icons/LocationMarkerIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

type ResourceType = 'Counselor' | 'Helpline' | 'NGO';

interface Resource {
  name: string;
  type: ResourceType;
  description: string;
  specializations: string[];
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  location: {
    address: string;
    city: string;
    county: string;
    region?: string;
  };
  operatingHours: string;
}

const resources: Resource[] = [
  {
    name: 'Mindful Kenya Counselors',
    type: 'Counselor',
    description: 'A team of certified professional counselors specializing in child and adolescent psychology. We offer one-on-one and family sessions.',
    specializations: ['Child Psychology', 'Family Therapy', 'Anxiety', 'Depression'],
    contact: {
      phone: '+254 712 345 678',
      email: 'contact@mindfulkenya.co.ke',
      website: 'www.mindfulkenya.co.ke',
    },
    location: {
      address: '123 Ngong Road',
      city: 'Nairobi',
      county: 'Nairobi',
    },
    operatingHours: 'Mon - Fri, 9:00 AM - 6:00 PM',
  },
  {
    name: 'Kenya Childline',
    type: 'Helpline',
    description: 'A 24/7 toll-free helpline for children in distress. We provide a safe space for children to share their problems and receive support.',
    specializations: ['24/7 Support', 'Crisis Intervention', 'Child Safety'],
    contact: {
      phone: '116',
      website: 'www.childlinekenya.co.ke',
    },
    location: {
      address: 'National Service',
      city: 'Nairobi',
      county: 'Nairobi',
    },
    operatingHours: '24 hours, 7 days a week',
  },
  {
    name: 'Bright Futures NGO',
    type: 'NGO',
    description: 'A non-profit organization dedicated to promoting mental wellness in schools through workshops, resources, and community programs for children and parents.',
    specializations: ['School Programs', 'Parent Workshops', 'Community Outreach'],
    contact: {
      phone: '+254 700 111 222',
      email: 'info@brightfutures.or.ke',
      website: 'www.brightfutures.or.ke',
    },
    location: {
      address: '45 Mfangano Street',
      city: 'Mombasa',
      county: 'Mombasa',
    },
    operatingHours: 'Mon - Fri, 8:30 AM - 5:00 PM',
  },
  {
    name: 'Valley Counseling Services',
    type: 'Counselor',
    description: 'Providing affordable and accessible mental health support for families in the Rift Valley region, with a focus on play therapy for young children.',
    specializations: ['Play Therapy', 'Adolescent Counseling', 'Grief Support'],
    contact: {
      phone: '+254 722 987 654',
      email: 'support@valleycounseling.co.ke',
    },
    location: {
      address: 'Kenyatta Avenue',
      city: 'Nakuru',
      county: 'Nakuru',
    },
    operatingHours: 'Mon - Sat, 10:00 AM - 4:00 PM',
  },
  {
    name: 'HopeLine Kenya',
    type: 'Helpline',
    description: 'A confidential helpline offering emotional support and guidance to young people and their caregivers dealing with mental health challenges.',
    specializations: ['Youth Support', 'Confidential', 'Emotional Guidance'],
    contact: {
      phone: '0800 221 333',
    },
    location: {
      address: 'National Helpline',
      city: 'Nairobi',
      county: 'Nairobi',
    },
    operatingHours: 'Daily, 8:00 AM - 8:00 PM',
  },
  {
    name: 'Pamoja Community Wellness',
    type: 'NGO',
    description: 'A community-based organization in Kisumu focused on destigmatizing mental health through local events, support groups, and educational materials.',
    specializations: ['Support Groups', 'Mental Health Awareness', 'Community Events'],
    contact: {
      phone: '+254 733 444 555',
      website: 'www.pamojawellness.or.ke',
    },
    location: {
      address: 'Oginga Odinga Street',
      city: 'Kisumu',
      county: 'Kisumu',
    },
    operatingHours: 'Office Hours: Mon - Fri, 9:00 AM - 5:00 PM',
  },
];

const TypeColors: { [key in ResourceType]: string } = {
  Counselor: 'bg-teal/20 text-teal',
  Helpline: 'bg-blue-500/20 text-blue-600',
  NGO: 'bg-purple-500/20 text-purple-600',
};

interface ConnectCareProps {
  onNavigate: (page: string) => void;
}

const ConnectCare: React.FC<ConnectCareProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResourceType | 'All'>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources = useMemo(() => {
    return resources
      .filter(r => activeFilter === 'All' || r.type === activeFilter)
      .filter(r => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          r.name.toLowerCase().includes(lowercasedTerm) ||
          r.description.toLowerCase().includes(lowercasedTerm) ||
          r.location.city.toLowerCase().includes(lowercasedTerm) ||
          r.location.county.toLowerCase().includes(lowercasedTerm) ||
          r.specializations.some(s => s.toLowerCase().includes(lowercasedTerm))
        );
      });
  }, [searchTerm, activeFilter]);

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
      {type}
    </button>
  );

  return (
    <section id="connect-care" className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-dark-text/80 hover:text-teal font-semibold transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <FilterButton type="Counselor" />
            <FilterButton type="Helpline" />
            <FilterButton type="NGO" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map(resource => (
            <div
              key={resource.name}
              onClick={() => setSelectedResource(resource)}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-heading text-dark-text pr-2">{resource.name}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${TypeColors[resource.type]}`}>
                  {resource.type}
                </span>
              </div>
              <p className="text-dark-text/70 mb-4 text-sm">{resource.location.city}, {resource.location.county}</p>
              <div className="flex-grow">
                <p className="text-dark-text/60 text-sm italic">"{resource.specializations[0]}, {resource.specializations[1]}..."</p>
              </div>
              <div className="mt-6 text-center">
                 <span className="font-bold text-teal hover:text-teal/80">View Details &rarr;</span>
              </div>
            </div>
          ))}
           {filteredResources.length === 0 && (
            <p className="text-center text-dark-text/60 md:col-span-2 lg:col-span-3">No resources found. Try adjusting your search or filters.</p>
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
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-dark-text pr-4">{selectedResource.name}</h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap mt-1 ${TypeColors[selectedResource.type]}`}>
                  {selectedResource.type}
                </span>
            </div>
            <p className="text-dark-text/80 mb-6">{selectedResource.description}</p>
            
            <div className="mb-6">
                <h4 className="font-bold text-dark-text mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                    {selectedResource.specializations.map(spec => (
                        <span key={spec} className="bg-pastel-green/60 text-dark-text/80 text-sm px-3 py-1 rounded-full">{spec}</span>
                    ))}
                </div>
            </div>

            <div className="space-y-4 text-dark-text/90 bg-light-bg p-4 rounded-lg">
                 <p><ClockIcon /> <strong>Hours:</strong> {selectedResource.operatingHours}</p>
                 <p><LocationMarkerIcon /> <strong>Location:</strong> {selectedResource.location.address}, {selectedResource.location.city}, {selectedResource.location.county}</p>
                 <p><PhoneIcon /> <strong>Phone:</strong> <a href={`tel:${selectedResource.contact.phone}`} className="text-teal hover:underline">{selectedResource.contact.phone}</a></p>
                 {selectedResource.contact.email && <p><strong>Email:</strong> <a href={`mailto:${selectedResource.contact.email}`} className="text-teal hover:underline">{selectedResource.contact.email}</a></p>}
                 {selectedResource.contact.website && <p><strong>Website:</strong> <a href={`https://${selectedResource.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">{selectedResource.contact.website}</a></p>}
            </div>

          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default ConnectCare;
