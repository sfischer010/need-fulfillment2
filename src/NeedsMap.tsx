import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import mapboxgl, { Map, MapMouseEvent, MapboxGeoJSONFeature, EventData } from 'mapbox-gl';
import type { Point } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';

declare const process: {
  env: {
    REACT_APP_MAPBOX_TOKEN: string;
  };
};
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

function isApproxEqual(a: number, b: number, tolerance = 0.0001): boolean {
  return Math.abs(a - b) < tolerance;
}

interface NeedsMapProps {
  setCurrentPage: (page: string) => void;
}

interface Coordinates {
  lng: number;
  lat: number;
}

const NeedsMap: React.FC<NeedsMapProps> = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [needsData, setNeedsData] = useState<MapboxGeoJSONFeature[] | null>(null);
  const [nonprofitsData, setNonprofitsData] = useState<MapboxGeoJSONFeature[] | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates>({ lng: -82.5515, lat: 35.5951 });
  const [showNeeds, setShowNeeds] = useState(true);
  const [showNonprofits, setShowNonprofits] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-need-data');
        const data = await response.json();
        setNeedsData(data.features);
      } catch (error) {
        console.error('Error fetching Need Points:', error);
      }
    };

    const fetchUserLocation = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-user-location');
        const locationData = await response.json();
        setUserLocation({ lng: locationData.longitude, lat: locationData.latitude });
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    const fetchNonprofitsData = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-nonprofits');
        const data = await response.json();
        setNonprofitsData(data.features ?? data);
      } catch (error) {
        console.error('Error fetching Nonprofits:', error);
      }
    };

    fetchNeedsData();
    fetchUserLocation();
    fetchNonprofitsData();
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!needsData || !nonprofitsData || !mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Needs source
      const geojsonNeedsData = {
        type: 'FeatureCollection' as const,
        features: Array.isArray(needsData)
          ? needsData.map((item: any) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: item.geometry.coordinates,
              },
              properties: {
                n_id: item.properties?.n_id,
                name: item.properties?.name,
                userId: item.properties?.userId,
                need: item.properties?.need,
                details: item.properties?.details,
                posteddate: item.properties?.posteddate,
              },
            }))
          : [],
      };

      map.addSource('needsData', {
        type: 'geojson',
        data: geojsonNeedsData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'needsData',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'needsData',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'needsData',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'need'],
            'Food and water', 'orange',
            'Shelter', 'green',
            'Money', 'blue',
            'Car help', 'red',
            'Financial aid', 'purple',
            'Misc', 'cyan',
            '#007cbf',
          ],
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

      // Nonprofits source + layer
      map.addSource('nonprofitsData', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: nonprofitsData,
        },
      });

      map.addLayer({
        id: 'nonprofits-layer',
        type: 'circle',
        source: 'nonprofitsData',
        paint: {
          'circle-color': 'black',
          'circle-radius': 5,
        },
      });

      map.setLayoutProperty('unclustered-point', 'visibility', showNeeds ? 'visible' : 'none');
      map.setLayoutProperty('nonprofits-layer', 'visibility', showNonprofits ? 'visible' : 'none');
    });

    // Needs popup
    map.on('click', 'unclustered-point', (e: MapMouseEvent & EventData) => {
      const bbox: [[number, number], [number, number]] = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      const needColorMap: Record<string, string> = {
        '1': '#f97316', // Food and water → orange
        '2': '#22c55e', // Shelter → green
        '3': '#3b82f6', // Money → blue
        '4': '#ef4444', // Car help → red
        '5': '#a855f7', // Financial aid → purple
        '6': '#06b6d4', // Misc → cyan
      };

      const features = map.queryRenderedFeatures(bbox, { layers: ['unclustered-point'] });
      if (!features.length) return;

      const feature = features[0] as MapboxGeoJSONFeature;
      if (feature.geometry.type !== 'Point') return;

      const coords = (feature.geometry as Point).coordinates as [number, number];
      const { n_id, name, need, details, userId, posteddate } = feature.properties as any;
      const titleColor = needColorMap[String(n_id)] ?? '#1f9ce9';
      console.log('Need ID:', n_id, 'Color:', titleColor, 'needColorMap[n_id]:', needColorMap[n_id]);
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <span class="popup-name" style="background-color: ${titleColor}; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block;">
          ${need}
        </span>
        <p class="popup-text">
          <strong>Name:</strong> ${name}<br/>
          <strong>Date:</strong> ${posteddate}<br/>
          <strong>Need:</strong> ${need}<br/>
          ${details}
        </p>
        <a href="#" class="popup-link">Message</a>
    `;
    popupContent.querySelector('.popup-link')?.addEventListener('click', ev => {
      ev.preventDefault();
      navigate(`/send-message/${userId}`);
    });

    new mapboxgl.Popup({ className: 'point-popup' })
      .setLngLat(coords)
      .setDOMContent(popupContent)
      .addTo(map);
    });

    // Nonprofits popup
    map.on('click', 'nonprofits-layer', (e: MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) => {
      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== 'Point') return;
      const coords = (feature.geometry as Point).coordinates as [number, number];
      const { name, description } = feature.properties as any;

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <span class="popup-name-nonprofit">${name}</span>
        <p class="popup-text"><strong>Description:</strong> ${description}</p>
      `;

      new mapboxgl.Popup({ className: 'point-popup' })
        .setLngLat(coords)
        .setDOMContent(popupContent)
        .addTo(map);
    });

    map.on('click', 'clusters', (e: MapMouseEvent & EventData) => {
      const bbox: [[number, number], [number, number]] = [
        [e.point.x, e.point.y],
        [e.point.x, e.point.y],
      ];
      const features = map.queryRenderedFeatures(bbox, { layers: ['clusters'] });
      if (!features.length) return;

      const clusterFeature = features[0] as MapboxGeoJSONFeature;
      const clusterId = clusterFeature.properties?.cluster_id;
      if (!clusterId) return;

      (map.getSource('needsData') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          if (clusterFeature.geometry.type === 'Point') {
            const coords = (clusterFeature.geometry as Point).coordinates as [number, number];
            map.easeTo({ center: coords, zoom });
          }
        }
      );
    });

    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'nonprofits-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'nonprofits-layer', () => {
      map.getCanvas().style.cursor = '';
    });

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [needsData, nonprofitsData, userLocation]);

  // Toggle visibility when state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const needsVisible = showNeeds ? 'visible' : 'none';

    if (map.getLayer('unclustered-point')) {
      map.setLayoutProperty('unclustered-point', 'visibility', needsVisible);
    }
    // Also toggle cluster layers and their count labels
    if (map.getLayer('clusters')) {
     map.setLayoutProperty('clusters', 'visibility', needsVisible);
    }
    if (map.getLayer('cluster-count')) {
      map.setLayoutProperty('cluster-count', 'visibility', needsVisible);
    }

    if (map.getLayer('nonprofits-layer')) {
      map.setLayoutProperty('nonprofits-layer', 'visibility', showNonprofits ? 'visible' : 'none');
    }
  }, [showNeeds, showNonprofits]);

  return (
    <div className="text-center" style={{ background: 'linear-gradient(to right, #2a2937, #5182f8' }}>
      <div className="toggle-buttons">
        <button
          className="px-4 py-2 rounded-t-md rounded-b-none font-semibold text-white bg-white/20 border border-white/30 backdrop-blur-md shadow-md hover:bg-white/30 hover:shadow-lg hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setShowNeeds(!showNeeds)}
        >
          {showNeeds ? 'Hide Needs' : 'Show Needs'}
        </button>
        &nbsp;
        <button
          className="px-4 py-2 rounded-t-md rounded-b-none font-semibold text-white bg-white/20 border border-white/30 backdrop-blur-md shadow-md hover:bg-white/30 hover:shadow-lg hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setShowNonprofits(!showNonprofits)}
        >
          {showNonprofits ? 'Hide Organizations' : 'Show Organizations'}
        </button>
      </div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '1024px', borderTop: '2px solid silver' }} />
    </div>
  );
};

export default NeedsMap;