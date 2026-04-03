import React from 'react';
import { MapPin, Phone, ExternalLink, Hospital } from 'lucide-react';

const EmergencyResources = () => {
  const nearbyHospitals = [
    {
      name: "SVIMS (Sri Venkateswara Institute of Medical Sciences)",
      address: "Alipiri Road, SV University Campus, Tirupati",
      distance: "1.2 km",
      type: "Super Speciality",
      landmark: "Near SVU Campus",
      contact: "0877 228 7777"
    },
    {
      name: "BIRRD Hospital",
      address: "SVIMS Campus, Tirupati",
      distance: "1.5 km",
      type: "Orthopaedic Speciality",
      landmark: "SVIMS Campus",
      contact: "0877 226 4220"
    },
    {
      name: "Ruia Hospital (SVRRGGH)",
      address: "Alipiri Road, Tirupati",
      distance: "2.0 km",
      type: "Govt. General Hospital",
      landmark: "Opposite SVIMS",
      contact: "108 (EMS)"
    },
    {
      name: "Sri Padmavathi Medical College for Women Hospital",
      address: "Tirupati",
      distance: "4.5 km",
      type: "Speciality Hospital",
      landmark: "Tirupati",
      contact: "0877 228 5555"
    }
  ];

  return (
    <div className="card glass-panel resource-card">
      <div className="card-header">
        <Hospital className="icon primary" />
        <h3>Nearby Emergency Resources</h3>
      </div>
      <p className="resource-address">
        <MapPin size={14} style={{ marginRight: '6px' }} />
        SV University Campus, Tirupati, AP - 517 501
      </p>
      
      <div className="hospital-list">
        {nearbyHospitals.map((hospital, index) => (
          <div key={index} className="hospital-item slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="hospital-info">
              <h4 className="hospital-name">{hospital.name}</h4>
              <p className="hospital-address">{hospital.address}</p>
              <div className="hospital-meta">
                <span className="distance-tag">{hospital.distance}</span>
                <span className="type-tag">{hospital.type}</span>
              </div>
            </div>
            <div className="hospital-actions">
              <a href={`tel:${hospital.contact}`} className="call-btn">
                <Phone size={14} /> Call
              </a>
              <button className="map-btn" title="View on Map">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="emergency-note">
        <AlertCircle size={14} style={{ marginRight: '6px' }} />
        Radius: 5km from project location
      </div>
    </div>
  );
};

// Simple AlertCircle fallback since it wasn't in the imports
const AlertCircle = ({ size, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default EmergencyResources;
