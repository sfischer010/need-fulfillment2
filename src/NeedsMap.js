import React, { useEffect, useState, useContext } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { AuthContext } from "./AuthContext"; 
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css'; 

mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw'; 

function isApproxEqual(a, b, tolerance = 0.0001) { 
  return Math.abs(a - b) < tolerance; 
}

function NeedsMap({ setCurrentPage }) { 
  const navigate = useNavigate(); 
  const { isLoggedIn } = useContext(AuthContext); 
  const [needsData, setNeedsData] = useState(null); 
  const [userLocation, setUserLocation] = useState({ lng: -82.5515, lat: 35.5951 }); // Default to Asheville, NC
  const [showNeeds, setShowNeeds] = useState(true); // Toggle for needs layer
  const [showNonprofits, setShowNonprofits] = useState(false); // Toggle for nonprofits layer
  const [nonprofitsData, setNonprofitsData] = useState(null); // Nonprofits GeoJSON data

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) { 
      navigate("/login"); 
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => { 
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-need-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setNeedsData(data);
      } catch (error) {
        console.error('Error fetching Need Points:', error);
      }
    };

    const fetchUserLocation = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-user-location');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const locationData = await response.json();
        setUserLocation({
          lng: locationData.longitude,
          lat: locationData.latitude,
        });
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    const fetchNonprofitsData = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-nonprofits');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNonprofitsData(data);
      } catch (error) {
        console.error('Error fetching Nonprofits:', error);
      }
    };

    fetchNeedsData();
    fetchUserLocation();
    fetchNonprofitsData();

  }, [isLoggedIn, navigate]); // dependencies for useEffect

  useEffect(() => {
    if (!needsData || !nonprofitsData) return;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.addSource('needsData', {
        type: 'geojson',
        data: needsData,
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
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40,
          ],
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

      map.addSource('nonprofitsData', {
        type: 'geojson',
        data: nonprofitsData,
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

      const highlightUserNeed = () => {
        const matchingPoints = needsData.features.filter(feature => {
          const [lng, lat] = feature.geometry.coordinates;
          return isApproxEqual(lng, userLocation.lng) && isApproxEqual(lat, userLocation.lat);
        });

        if (matchingPoints.length > 0) {
          map.setPaintProperty('unclustered-point', 'circle-stroke-color', [
            'case',
            ['==', ['get', 'coordinates'], [userLocation.lng, userLocation.lat]],
            'yellow',
            '#fff'
          ]);
          map.setPaintProperty('unclustered-point', 'circle-stroke-width', [
            'case',
            ['==', ['get', 'coordinates'], [userLocation.lng, userLocation.lat]],
            3,
            1
          ]);
        }
      };

      highlightUserNeed();

      map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, need, details, userId } = e.features[0].properties;
        console.log(userId);
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <span class="popup-name">${name}</span>
          <p class="popup-text"><strong>Need:</strong> ${need}<span><br />${details}</span></p>
          <span><a href="#" class="popup-link">Message</a></span>
        `;

        const handleSendMessageClick = (event) => {
          event.preventDefault();
          navigate(`/send-message/${userId}`);
        };

        const messageLink = popupContent.querySelector('.popup-link');
        messageLink.addEventListener('click', handleSendMessageClick);

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(map);
      });

      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('needsData').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          });
        });
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'nonprofits-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, description } = e.features[0].properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <span class="popup-name-nonprofit">${name}</span>
          <p class="popup-text"><strong>Nonprofit:</strong> ${name}</p>
          <p class="popup-text"><strong>Description:</strong> ${description}</p>
        `;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(map);
      });

      map.on('mouseenter', 'nonprofits-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'nonprofits-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => map.remove();
  }, [needsData, nonprofitsData, showNeeds, showNonprofits, userLocation, navigate]);

  useEffect(() => {
    if (!needsData) return;

    const map = mapboxgl.Map.prototype._map; // Access the existing map instance
    if (map && map.getLayer('unclustered-point')) {
      map.setLayoutProperty('unclustered-point', 'visibility', showNeeds ? 'visible' : 'none');
    }
  }, [showNeeds, needsData]);

  return (
    <div className="bg-blue-500 border-t border-gray-400 text-center">
      <div className="toggle-buttons">
        <button 
          className="bg-white text-black px-4 py-2 rounded" 
          onClick={() => setShowNeeds(!showNeeds)}
        >
          {showNeeds ? 'Hide Needs' : 'Show Needs'}
        </button>
        <button 
          className="bg-white text-black px-4 py-2 rounded" 
          onClick={() => setShowNonprofits(!showNonprofits)}
        >
          {showNonprofits ? 'Hide Nonprofits' : 'Show Nonprofits'}
        </button>
      </div>
      <div id="map" style={{ width: '100%', height: '1024px' }}></div>
    </div>
  );
}

export default NeedsMap;