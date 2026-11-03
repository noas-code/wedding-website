import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ArrowUpRight, Heart, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { wedding, places } from './content';

export default function HighlightsMap({ selectedPlace, onSelect }) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(new Map());
  const onSelectRef = useRef(onSelect);
  const [tileError, setTileError] = useState(false);
  onSelectRef.current = onSelect;
  useEffect(() => {
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView(wedding.mapCenter, 13);
    map.current = instance;
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
    }).addTo(instance);
    tiles.on('tileerror', () => setTileError(true));
    places.forEach((place, index) => {
      const icon = L.divIcon({ className: 'custom-marker', html: `<span><b>${index + 1}</b></span>`, iconSize: [34, 34], iconAnchor: [17, 34] });
      const marker = L.marker(place.coordinates, { icon, title: place.name, alt: place.name }).addTo(instance);
      const popup = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = place.name;
      const tip = document.createElement('p');
      tip.textContent = place.tip;
      popup.append(title, tip);
      marker.bindPopup(popup);
      marker.on('click', () => onSelectRef.current(place.id));
      markers.current.set(place.id, marker);
    });
    instance.fitBounds(L.latLngBounds(places.map(place => place.coordinates)), { padding: [35, 35] });
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => { observer.disconnect(); markers.current.clear(); instance.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const marker = markers.current.get(selectedPlace);
    if (marker && map.current) {
      map.current.setView(marker.getLatLng(), 14);
      marker.openPopup();
    }
  }, [selectedPlace]);
  const selected = places.find(place => place.id === selectedPlace);
  return <section id="map" className="section map-section">
    <div className="map-copy"><p className="eyebrow"><MapPin size={15} /> PIN A LITTLE ADVENTURE</p><h2>Love, <em>all over<br />the map.</em></h2><p>Our favorite corners of Lisbon, in one handy place. Pick a pin and go exploring.</p>
      <div className="map-list">{places.map((place, index) => <button key={place.id} className={selectedPlace === place.id ? 'selected' : ''} onClick={() => onSelect(place.id)} aria-pressed={selectedPlace === place.id}><span className={`pin-number ${place.color}`}>{index + 1}</span><span><strong>{place.name}</strong><small>{place.neighborhood}</small></span><ArrowUpRight size={16} /></button>)}</div>
      {selected && <a className="text-link" href={selected.url} target="_blank" rel="noreferrer">Explore {selected.neighborhood} <ArrowUpRight size={15} /></a>}
      <small className="map-note">Wedding venues will be added once confirmed.</small>
    </div>
    <div className="map-frame"><div ref={container} className="map-canvas" role="region" aria-label="Interactive map of our Lisbon recommendations" />{tileError && <div className="map-warning" role="status">Map tiles need an internet connection. You can still explore the places using the list.</div>}<span className="map-label"><Heart size={13} fill="currentColor" /> OUR LITTLE LISBON GUIDE</span></div>
  </section>;
}
