import React, { useRef, useEffect } from 'react';
import { MapPin, Navigation, Compass, Hospital, Phone, Activity } from 'lucide-react';

const LocationTracking = () => {
  const containerRef = useRef(null);

  const nearbyHospitals = [
    {
      name: "SVIMS (Sri Venkateswara Institute of Medical Sciences)",
      address: "Alipiri Road, SV University Campus, Tirupati",
      distance: "1.2 km",
      time: "4 mins",
      type: "Super Speciality",
      contact: "0877 228 7777",
      color: "border-brand-primary",
      iconColor: "text-brand-primary",
      bgHighlight: "bg-brand-primary/10",
      rawDistance: 1.2
    },
    {
      name: "BIRRD Hospital",
      address: "SVIMS Campus, Tirupati",
      distance: "1.5 km",
      time: "5 mins",
      type: "Orthopaedic",
      contact: "0877 226 4220",
      color: "border-purple-500",
      iconColor: "text-purple-400",
      bgHighlight: "bg-purple-500/10",
      rawDistance: 1.5
    },
    {
      name: "Ruia Hospital (SVRRGGH)",
      address: "Alipiri Road, Tirupati",
      distance: "2.0 km",
      time: "7 mins",
      type: "Govt. General Hospital",
      contact: "108",
      color: "border-blue-500",
      iconColor: "text-blue-500",
      bgHighlight: "bg-blue-500/10",
      rawDistance: 2.0
    },
    {
      name: "Apollo Hospitals",
      address: "Muthyala Reddy Palle, Tirupati",
      distance: "5.5 km",
      time: "15 mins",
      type: "Private Multi-Speciality",
      contact: "1066",
      color: "border-red-500",
      iconColor: "text-red-500",
      bgHighlight: "bg-red-500/10",
      rawDistance: 5.5
    }
  ].sort((a, b) => a.rawDistance - b.rawDistance);

  useEffect(() => {
    // Initial transform setup for 3D effect
    if (containerRef.current) {
      handleScroll({ target: containerRef.current });
    }
  }, []);

  const handleScroll = (e) => {
    if (!e || !e.target) return;
    const cards = e.target.querySelectorAll('.hospital-card');
    const scrollTop = e.target.scrollTop;
    
    cards.forEach((card, index) => {
      // Estimated height + gap per card
      const cardTop = index * 220; 
      const distance = cardTop - scrollTop;
      
      let scale = 1;
      let translateZ = 0;
      let rotateX = 0;
      let opacity = 1;
      
      // Apply 3D anti-gravity tunnel effect to cards below current scroll
      if (distance > 0) {
        const factor = Math.min(1, distance / 400); 
        scale = 1 - factor * 0.1; // scale down
        translateZ = -Math.abs(factor * 120); // shift back
        rotateX = factor * 12; // tilt backwards to create a receding tunnel look
        opacity = Math.max(0.6, 1 - factor * 0.4); // fade slightly
      }
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`;
      card.style.opacity = opacity;
    });
  };

  // SV University directions to SVIMS map URL
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15501.196584288673!2d79.3980327!3d13.6338879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d4b1a896677f5%3A0xe5a3c1032dfa3f65!2sSri%20Venkateswara%20Institute%20of%20Medical%20Sciences!5e0!3m2!1sen!2sin!4v1703673413941!5m2!1sen!2sin`;

  return (
    <div className="flex flex-col gap-6 mt-4 relative">
      <style>{`
        @keyframes dropIn3D {
          0% {
            opacity: 0;
            transform: translateY(-60px) scale(0.9) perspective(1000px) rotateX(-20deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) perspective(1000px) rotateX(0deg);
          }
        }
        .anim-drop-in {
          animation: dropIn3D 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
        }
      `}</style>
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-7 h-7 text-brand-primary animate-bounce drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-wide">GPS & Location Tracking</h2>
            <p className="text-sm text-slate-400 font-light">Live Satellite Feed & Emergency Routes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          Live Signal Feed
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[500px]">
        
        {/* Map Section */}
        <div className="glass-card rounded-2xl shadow-sm border-white/5 p-2 relative h-[500px] flex flex-col group overflow-hidden">
          <div className="absolute top-6 left-6 right-6 flex justify-between z-10 pointer-events-none gap-2">
            <div className="bg-[rgba(15,23,42,0.8)] backdrop-blur-md border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-white pointer-events-auto transition-transform hover:scale-105">
              <Compass className="w-4 h-4 text-brand-primary" />
              Location: SVU Campus
            </div>
            <div className="bg-red-500/90 backdrop-blur-md border border-red-400 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] text-white pointer-events-auto transition-transform hover:scale-105">
              <Navigation className="w-4 h-4" />
              Nearest: SVIMS (4m)
            </div>
          </div>
          
          <iframe 
            src={mapUrl} 
            className="w-full h-full rounded-xl flex-1 border-0"
            style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(105%)' }}
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Nearest Hospital"
          ></iframe>
          
          <div className="absolute inset-2 rounded-xl pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] z-0 mix-blend-overlay"></div>
        </div>

        {/* Hospitals Vertical Section */}
        <div className="glass-card rounded-2xl shadow-sm border-white/5 p-6 flex flex-col h-[500px] overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]" />
              <h3 className="text-xl font-display font-bold text-white tracking-wide">Nearby Hospitals</h3>
            </div>
          </div>

          {/* Vertical Scroll Container with preserve-3d */}
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-col gap-4 overflow-y-auto pb-4 flex-1 pr-2"
            style={{ 
              transformStyle: 'preserve-3d', 
              perspective: '1000px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}
          >
            {nearbyHospitals.map((hospital, idx) => (
              <div 
                key={idx}
                className="anim-drop-in shrink-0"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div 
                  className={`hospital-card flex flex-col p-5 rounded-2xl border-l-4 ${hospital.color} glass-panel bg-black/30 shadow-lg hover:bg-black/40 transition-all duration-300 ease-out origin-top`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${hospital.bgHighlight} ${hospital.iconColor} border border-white/5 shrink-0`}>
                      <Hospital className="w-6 h-6 drop-shadow-md" />
                    </div>
                    <div className="flex-1">
                      {/* Bold teal highlight for hospital name */}
                      <h4 className="font-bold text-lg font-display text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-brand-primary leading-tight mb-1">{hospital.name}</h4>
                      <span className="inline-block text-[10px] bg-white/10 text-slate-300 px-2.5 py-1 rounded-md font-medium tracking-wide uppercase border border-white/5">{hospital.type}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-5 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                    {hospital.address}
                  </p>
                  
                  <div className="flex gap-3 mb-5">
                    <div className="flex-1 bg-black/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-widest text-slate-500">Distance</span>
                      <span className="text-lg font-black text-white">{hospital.distance}</span>
                    </div>
                    <div className="flex-1 bg-red-500/10 rounded-lg p-3 border border-red-500/20 flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-widest text-red-500">ETA</span>
                      <span className="text-lg font-black text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]">{hospital.time}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a 
                      href={`tel:${hospital.contact}`}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                      <Phone className="w-4 h-4" /> Dispatch
                    </a>
                    <button className="flex-1 border border-brand-primary/30 text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all hover:shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                      <Navigation className="w-4 h-4" /> Route
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default LocationTracking;
