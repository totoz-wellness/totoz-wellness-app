import React from 'react';
import { 
  X, MapPin, Phone, Mail, Globe, Clock, 
  Download, Share2, ExternalLink, Heart 
} from 'lucide-react';
import { trackResourceView, trackResourceContact, trackResourceShare, trackResourceExport } from '../../utils/analytics';
import { exportResourceToPDF } from '../../utils/exportPDF';

interface ResourceDetailModalProps {
  resource: any;
  onClose: () => void;
  typeConfig: any;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  typeConfig,
  isFavorite,
  onToggleFavorite
}) => {
  React.useEffect(() => {
    trackResourceView(resource.id, resource.name, resource.type);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [resource]);

  const handleContactClick = (method: 'phone' | 'email' | 'website') => {
    trackResourceContact(resource.id, resource.name, method);
  };

  const handleShare = async () => {
    const shareData = {
      title: resource.name,
      text: resource.description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackResourceShare(resource.id, resource.name);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const textToCopy = `${resource.name}\n\n${resource.description}\n\n${window.location.href}`;
      await navigator.clipboard.writeText(textToCopy);
      alert('Resource details copied to clipboard!');
      trackResourceShare(resource.id, resource.name);
    }
  };

  const handleExport = () => {
    exportResourceToPDF(resource, typeConfig);
    trackResourceExport(resource.id, resource.name);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center pointer-events-none">
        <div className="pointer-events-auto w-full md:max-w-3xl md:mx-auto md:my-8">
          <div 
            className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-title"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 md:p-8 z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 
                    id="resource-title"
                    className="text-3xl font-extrabold text-gray-900 mb-3"
                  >
                    {resource.name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-1. 5 text-sm font-bold rounded-full ${typeConfig[resource.type].bg} ${typeConfig[resource.type].color}`}>
                      {typeConfig[resource.type].label}
                    </span>
                    
                    {resource.isFeatured && (
                      <span className="px-4 py-1.5 text-sm font-bold bg-amber-50 text-amber-800 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    
                    {resource.isVerified && (
                      <span className="px-4 py-1.5 text-sm font-bold bg-teal-50 text-teal-800 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Action Buttons */}
                  <button
                    onClick={onToggleFavorite}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    aria-label="Share resource"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={handleExport}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    aria-label="Export to PDF"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Description */}
              <div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Specializations */}
              {resource.specializations?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.specializations.map((spec: string) => (
                      <span 
                        key={spec} 
                        className="px-4 py-2 bg-teal-50 text-teal-800 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Contact Information</h3>

                {resource.operatingHours && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block mb-1">Operating Hours</span>
                      <p className="text-gray-700">{resource.operatingHours}</p>
                    </div>
                  </div>
                )}

                {(resource.location.address || resource.location.city) && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block mb-1">Location</span>
                      <p className="text-gray-700">
                        {[
                          resource.location.address,
                          resource.location.city,
                          resource.location. county,
                          resource.location.region
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {resource.contact. phone && (
                  <a 
                    href={`tel:${resource.contact.phone}`}
                    onClick={() => handleContactClick('phone')}
                    className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group"
                  >
                    <Phone className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 block mb-1">Phone</span>
                      <span className="text-teal-700 font-medium">{resource.contact.phone}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {resource.contact. email && (
                  <a 
                    href={`mailto:${resource.contact.email}`}
                    onClick={() => handleContactClick('email')}
                    className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 block mb-1">Email</span>
                      <span className="text-teal-700 font-medium break-all">{resource.contact. email}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {resource.contact.website && (
                  <a
                    href={resource.contact. website. startsWith('http') ? resource. contact.website : `https://${resource.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleContactClick('website')}
                    className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group"
                  >
                    <Globe className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 block mb-1">Website</span>
                      <span className="text-teal-700 font-medium underline break-all">
                        {resource.contact. website}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-teal-600" />
                  </a>
                )}
              </div>

              {/* Languages */}
              {resource.languages?. length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                  <p className="text-gray-700">{resource.languages.join(', ')}</p>
                </div>
              )}

              {/* Tags */}
              {resource.tags?.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag: string) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailModal;