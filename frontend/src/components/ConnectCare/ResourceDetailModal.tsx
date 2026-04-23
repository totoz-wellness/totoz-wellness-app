import React from 'react';
import { X, MapPin, Phone, Mail, Globe, Clock, Download, Share2, ExternalLink, Heart } from 'lucide-react';
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
  resource, onClose, typeConfig, isFavorite, onToggleFavorite,
}) => {
  React.useEffect(() => {
    trackResourceView(resource.id, resource.name, resource.type);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [resource]);

  const cfg = typeConfig[resource.type] || { label: resource.type, color: 'text-[#1e3a6e]', bg: 'bg-[#1e3a6e]/8' };

  const handleShare = async () => {
    const shareData = { title: resource.name, text: resource.description, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); trackResourceShare(resource.id, resource.name); } catch {}
    } else {
      await navigator.clipboard.writeText(`${resource.name}\n\n${resource.description}\n\n${window.location.href}`);
      trackResourceShare(resource.id, resource.name);
    }
  };

  const handleExport = () => {
    exportResourceToPDF(resource, typeConfig);
    trackResourceExport(resource.id, resource.name);
  };

  const contactRowClass = 'flex items-start gap-4 p-4 bg-[#fbfbfb] rounded-xl border border-[#1e3a6e]/6 hover:border-[#e9924b]/25 transition-colors group';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1e3a6e]/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center pointer-events-none">
        <div className="pointer-events-auto w-full md:max-w-2xl md:mx-auto md:my-8">
          <div
            className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-title"
          >
            {/* Sticky header */}
            <div className="sticky top-0 bg-white border-b border-[#1e3a6e]/8 px-6 py-5 z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {resource.isFeatured && (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#e9924b]/10 text-[#e9924b] uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                    {resource.isVerified && (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#659ec3]/10 text-[#659ec3] uppercase tracking-wide">
                        Verified
                      </span>
                    )}
                  </div>
                  <h2 id="resource-title" className="font-heading font-extrabold text-[#1e3a6e] text-xl leading-snug truncate">
                    {resource.name}
                  </h2>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {[
                    { icon: <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#e9924b] text-[#e9924b]' : 'text-[#1e3a6e]/50'}`} />, action: onToggleFavorite, label: isFavorite ? 'Remove' : 'Save' },
                    { icon: <Share2 className="w-4 h-4 text-[#1e3a6e]/50" />, action: handleShare, label: 'Share' },
                    { icon: <Download className="w-4 h-4 text-[#1e3a6e]/50" />, action: handleExport, label: 'Export' },
                    { icon: <X className="w-4 h-4 text-[#1e3a6e]/50" />, action: onClose, label: 'Close' },
                  ].map(({ icon, action, label }) => (
                    <button
                      key={label}
                      onClick={action}
                      aria-label={label}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#1e3a6e]/6 transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-6">
              {/* Description */}
              <p className="text-[#1e3a6e]/65 text-sm leading-[1.8]">{resource.description}</p>

              {/* Specializations */}
              {resource.specializations?.length > 0 && (
                <div>
                  <p className="text-xs text-[#1e3a6e]/35 tracking-widest uppercase mb-3">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.specializations.map((spec: string) => (
                      <span key={spec} className="px-3 py-1.5 bg-[#659ec3]/10 text-[#659ec3] rounded-full text-xs font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div>
                <p className="text-xs text-[#1e3a6e]/35 tracking-widest uppercase mb-3">Contact</p>
                <div className="space-y-2">
                  {resource.operatingHours && (
                    <div className={contactRowClass}>
                      <Clock className="w-4 h-4 text-[#1e3a6e]/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[#1e3a6e] text-xs mb-0.5">Operating Hours</p>
                        <p className="text-[#1e3a6e]/60 text-sm">{resource.operatingHours}</p>
                      </div>
                    </div>
                  )}

                  {(resource.location.address || resource.location.city) && (
                    <div className={contactRowClass}>
                      <MapPin className="w-4 h-4 text-[#1e3a6e]/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[#1e3a6e] text-xs mb-0.5">Location</p>
                        <p className="text-[#1e3a6e]/60 text-sm">
                          {[resource.location.address, resource.location.city, resource.location.county, resource.location.region].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {resource.contact.phone && (
                    <a href={`tel:${resource.contact.phone}`} onClick={() => trackResourceContact(resource.id, resource.name, 'phone')} className={`${contactRowClass} cursor-pointer`}>
                      <Phone className="w-4 h-4 text-[#e9924b] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#1e3a6e] text-xs mb-0.5">Phone</p>
                        <p className="text-[#e9924b] text-sm font-medium">{resource.contact.phone}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#1e3a6e]/20 group-hover:text-[#e9924b]/60 transition-colors" />
                    </a>
                  )}

                  {resource.contact.email && (
                    <a href={`mailto:${resource.contact.email}`} onClick={() => trackResourceContact(resource.id, resource.name, 'email')} className={`${contactRowClass} cursor-pointer`}>
                      <Mail className="w-4 h-4 text-[#659ec3] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1e3a6e] text-xs mb-0.5">Email</p>
                        <p className="text-[#659ec3] text-sm font-medium break-all">{resource.contact.email}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#1e3a6e]/20 group-hover:text-[#659ec3]/60 transition-colors flex-shrink-0" />
                    </a>
                  )}

                  {resource.contact.website && (
                    <a
                      href={resource.contact.website.startsWith('http') ? resource.contact.website : `https://${resource.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackResourceContact(resource.id, resource.name, 'website')}
                      className={`${contactRowClass} cursor-pointer`}
                    >
                      <Globe className="w-4 h-4 text-[#1e3a6e]/40 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1e3a6e] text-xs mb-0.5">Website</p>
                        <p className="text-[#659ec3] text-sm underline underline-offset-2 break-all">{resource.contact.website}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#659ec3]/60 flex-shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Languages */}
              {resource.languages?.length > 0 && (
                <div className="pt-4 border-t border-[#1e3a6e]/6">
                  <p className="text-xs text-[#1e3a6e]/35 tracking-widest uppercase mb-2">Languages</p>
                  <p className="text-[#1e3a6e]/60 text-sm">{resource.languages.join(', ')}</p>
                </div>
              )}

              {/* Tags */}
              {resource.tags?.length > 0 && (
                <div className="pt-4 border-t border-[#1e3a6e]/6">
                  <p className="text-xs text-[#1e3a6e]/35 tracking-widest uppercase mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 bg-[#e9924b]/8 text-[#e9924b] text-xs font-medium rounded-full border border-[#e9924b]/15">
                        {tag}
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