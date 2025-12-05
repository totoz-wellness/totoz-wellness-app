import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  location: {
    latitude?: number;
    longitude?: number;
    city?: string;
  };
  isVerified: boolean;
  isFeatured: boolean;
}

interface ResourceMapProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  selectedResource: Resource | null;
  userLocation: { lat: number; lng: number } | null;
}

// Component to handle map centering
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const ResourceMap: React.FC<ResourceMapProps> = ({
  resources,
  onResourceClick,
  selectedResource,
  userLocation
}) => {
  // Filter resources with valid coordinates
  const mappableResources = resources.filter(r => 
    r.location.latitude && r.location.longitude
  );

  // Determine map center
  const center: [number, number] = selectedResource?. location.latitude
    ? [selectedResource.location.latitude, selectedResource.location.longitude]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-1.286389, 36.817223]; // Nairobi default
  const zoom = selectedResource ? 14 : userLocation ? 12 : 11;

  // Custom marker icons
  const verifiedIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3. org/2000/svg">
        <path d="M12. 5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#3AAFA9"/>
        <circle cx="12.5" cy="12.5" r="5" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const unverifiedIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#6B7280"/>
        <circle cx="12.5" cy="12.5" r="5" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const featuredIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9. 375 12.5 28. 5 12.5 28. 5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#3AAFA9" stroke="#F59E0B" stroke-width="2"/>
        <circle cx="12.5" cy="12.5" r="5" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const userLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#2563EB" opacity="0.3"/>
        <circle cx="10" cy="10" r="5" fill="#2563EB"/>
        <circle cx="10" cy="10" r="2" fill="white"/>
      </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const getMarkerIcon = (resource: Resource) => {
    if (resource. isFeatured) return featuredIcon;
    if (resource.isVerified) return verifiedIcon;
    return unverifiedIcon;
  };

  if (mappableResources.length === 0 && ! userLocation) {
    return (
      <div className="h-[600px] w-full rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-gray-200">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No locations to display</p>
          <p className="text-sm text-gray-500 mt-2">Resources need latitude/longitude coordinates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapController center={center} zoom={zoom} />
          
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker 
              position={[userLocation. lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-sm text-blue-700">📍 Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Resource Markers */}
          {mappableResources.map((resource) => (
            <Marker
              key={resource.id}
              position={[resource.location. latitude!, resource.location.longitude! ]}
              icon={getMarkerIcon(resource)}
              eventHandlers={{
                click: () => onResourceClick(resource)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-sm text-gray-900 mb-2">
                    {resource.name}
                  </h3>
                  {resource.location.city && (
                    <p className="text-xs text-gray-600 mb-2">
                      📍 {resource.location.city}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {resource.isVerified && (
                      <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded">
                        ✓ Verified
                      </span>
                    )}
                    {resource.isFeatured && (
                      <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {resource.description}
                  </p>
                  <button
                    onClick={() => onResourceClick(resource)}
                    className="mt-3 w-full px-3 py-1. 5 bg-teal text-white text-xs font-semibold rounded hover:bg-teal/90 transition-colors"
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
      <div className="flex flex-wrap gap-4 text-sm bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal rounded-full shadow-sm" />
          <span className="text-gray-700 font-medium">Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm" />
          <span className="text-gray-700 font-medium">Unverified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal rounded-full border-2 border-amber-500 shadow-sm" />
          <span className="text-gray-700 font-medium">Featured</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full shadow-sm animate-pulse" />
            <span className="text-gray-700 font-medium">Your Location</span>
          </div>
        )}
      </div>

      {/* Map Info */}
      <div className="text-xs text-gray-500 text-center">
        Showing {mappableResources.length} location{mappableResources.length !== 1 ? 's' : ''} on map
      </div>
    </div>
  );
};

export default ResourceMap;