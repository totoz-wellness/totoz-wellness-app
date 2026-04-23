import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

interface Resource {
  id: string; name: string; type: string; description: string;
  location: { latitude?: number; longitude?: number; city?: string };
  isVerified: boolean; isFeatured: boolean;
}

interface ResourceMapProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  selectedResource: Resource | null;
  userLocation: { lat: number; lng: number } | null;
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
};

// Brand-colored SVG pin factory
const makePinIcon = (fill: string, stroke?: string) =>
  new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,' +
      btoa(
        `<svg width="22" height="36" viewBox="0 0 22 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.925 0 0 4.925 0 11c0 8.25 11 25 11 25S22 19.25 22 11C22 4.925 17.075 0 11 0z"
            fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width="2"` : ''}/>
          <circle cx="11" cy="11" r="4.5" fill="white"/>
        </svg>`
      ),
    iconSize: [22, 36],
    iconAnchor: [11, 36],
    popupAnchor: [0, -32],
  });

const icons = {
  featured:   makePinIcon('#e9924b', '#1e3a6e'),
  verified:   makePinIcon('#659ec3'),
  default:    makePinIcon('#1e3a6e'),
  user: new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,' +
      btoa(
        `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="9" fill="#e9924b" opacity="0.25"/>
          <circle cx="9" cy="9" r="5" fill="#e9924b"/>
          <circle cx="9" cy="9" r="2" fill="white"/>
        </svg>`
      ),
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }),
};

const getIcon = (r: Resource) =>
  r.isFeatured ? icons.featured : r.isVerified ? icons.verified : icons.default;

const ResourceMap: React.FC<ResourceMapProps> = ({ resources, onResourceClick, selectedResource, userLocation }) => {
  const mappable = resources.filter(r => r.location.latitude && r.location.longitude);
  const center: [number, number] = selectedResource?.location.latitude
    ? [selectedResource.location.latitude, selectedResource.location.longitude!]
    : userLocation ? [userLocation.lat, userLocation.lng] : [-1.286389, 36.817223];
  const zoom = selectedResource ? 14 : userLocation ? 12 : 11;

  if (mappable.length === 0 && !userLocation) {
    return (
      <div className="h-[560px] w-full rounded-2xl bg-[#1e3a6e]/4 border border-[#1e3a6e]/8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#1e3a6e]/6 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-[#1e3a6e]/30" />
          </div>
          <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">No locations to display</p>
          <p className="text-[#1e3a6e]/40 text-xs">Resources need coordinates to appear on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-[560px] w-full rounded-2xl overflow-hidden shadow-sm border border-[#1e3a6e]/8">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <MapController center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
              <Popup><p className="font-semibold text-xs text-[#1e3a6e]">Your location</p></Popup>
            </Marker>
          )}
          {mappable.map((r) => (
            <Marker
              key={r.id}
              position={[r.location.latitude!, r.location.longitude!]}
              icon={getIcon(r)}
              eventHandlers={{ click: () => onResourceClick(r) }}
            >
              <Popup>
                <div className="min-w-[180px] p-1">
                  <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">{r.name}</p>
                  {r.location.city && <p className="text-xs text-[#1e3a6e]/50 mb-2">{r.location.city}</p>}
                  <div className="flex gap-1.5 mb-2">
                    {r.isVerified && <span className="text-[10px] font-bold text-[#659ec3] bg-[#659ec3]/10 px-2 py-0.5 rounded-full">Verified</span>}
                    {r.isFeatured && <span className="text-[10px] font-bold text-[#e9924b] bg-[#e9924b]/10 px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                  <p className="text-xs text-[#1e3a6e]/55 line-clamp-2 mb-2">{r.description}</p>
                  <button
                    onClick={() => onResourceClick(r)}
                    className="w-full px-3 py-1.5 bg-[#e9924b] text-white text-xs font-semibold rounded-lg hover:bg-[#d4762a] transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 px-1">
        {[
          { color: '#659ec3', label: 'Verified' },
          { color: '#e9924b', label: 'Featured', border: '#1e3a6e' },
          { color: '#1e3a6e', label: 'Other' },
          ...(userLocation ? [{ color: '#e9924b', label: 'Your location', pulse: true }] : []),
        ].map(({ color, label, border, pulse }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: color, border: border ? `2px solid ${border}` : undefined }}
            />
            <span className="text-[#1e3a6e]/50 text-xs">{label}</span>
          </div>
        ))}
        <span className="text-[#1e3a6e]/25 text-xs ml-auto">
          {mappable.length} location{mappable.length !== 1 ? 's' : ''} on map
        </span>
      </div>
    </div>
  );
};

export default ResourceMap;