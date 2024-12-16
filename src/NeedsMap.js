/*
import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function NeedsMap() {
  const [needsData, setNeedsData] = useState(null);
  const [userLocation, setUserLocation] = useState({ lng: -82.5515, lat: 35.5951 }); // Default to Asheville, NC

  // Fetch need data from the server endpoint
  useEffect(() => {
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-need-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNeedsData(data);
      } catch (error) {
        console.error('Error fetching Need Points:', error);
      }
    };

    const fetchUserLocation = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-user-location');
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

    fetchNeedsData();
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (!needsData) return;

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.addSource('needsData', {
        type: 'geojson',
        data: needsData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Clusters
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
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      // Cluster Count
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'needsData',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Unclustered Point Layer
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
            '#007cbf' // Default color
          ],
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Show info popup
      map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, need, details } = e.features[0].properties;

        // Ensure the popup doesn't use stale coordinates
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<span class="popup-name">${name}</span><p class="popup-text"><strong>Need:</strong> ${need}<span><br />${details}</span></p><span><a href="/message" class="popup-link">Message</a></span>`)
          .addTo(map);
      });
      
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });

      // Zoom to cluster on click
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('needsData').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        });
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('error', (e) => {
        console.error('Error loading needs data layer:', e);
      });
    });
  }, [needsData, userLocation]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '1024px' }}></div>
    </div>
  );
}

export default NeedsMap;
*/

/*
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw';

function isApproxEqual(a, b, tolerance = 0.0001) {
  return Math.abs(a - b) < tolerance;
}

function NeedsMap({ setCurrentPage }) {
  const navigate = useNavigate();
  const handleSendMessageClick = () => {
    setCurrentPage('SendMessage');
  };

  const [needsData, setNeedsData] = useState(null);
  const [userLocation, setUserLocation] = useState({ lng: -82.5515, lat: 35.5951 }); // Default to Asheville, NC

  useEffect(() => {
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-need-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNeedsData(data);
      } catch (error) {
        console.error('Error fetching Need Points:', error);
      }
    };

    const fetchUserLocation = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-user-location');
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

    fetchNeedsData();
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (!needsData) return;

    // Initialize Mapbox
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
        const { name, need, details } = e.features[0].properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <span class="popup-name">${name}</span>
        <p class="popup-text"><strong>Need:</strong> ${need}<span><br />${details}</span></p>
        <span><a href="#" class="popup-link">Message</a></span>
      `;

      const messageLink = popupContent.querySelector('.popup-link');

      messageLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/SendMessage');
      });

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setDOMContent(popupContent)
        .addTo(map);
  }, [navigate]);

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
    });
  }, [needsData, userLocation]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '1024px' }}></div>
    </div>
  );
}

export default NeedsMap;
*/
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw';

function isApproxEqual(a, b, tolerance = 0.0001) {
  return Math.abs(a - b) < tolerance;
}

function NeedsMap({ setCurrentPage }) {
  const navigate = useNavigate();
  const [needsData, setNeedsData] = useState(null);
  const [userLocation, setUserLocation] = useState({ lng: -82.5515, lat: 35.5951 });

  useEffect(() => {
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-need-data');
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
        const response = await fetch('http://localhost:5000/api/get-user-location');
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

    fetchNeedsData();
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (!needsData) return;

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
    });
  }, [needsData, userLocation, navigate]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '1024px' }}></div>
    </div>
  );
}

export default NeedsMap;


/*
import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw';

function isApproxEqual(a, b, tolerance = 0.0001) {
  return Math.abs(a - b) < tolerance;
}

function NeedsMap() {
  const [needsData, setNeedsData] = useState(null);
  const [userLocation, setUserLocation] = useState({ lng: -82.5515, lat: 35.5951 }); // Default to Asheville, NC

  useEffect(() => {
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-need-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNeedsData(data);
      } catch (error) {
        console.error('Error fetching Need Points:', error);
      }
    };

    const fetchUserLocation = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-user-location');
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

    fetchNeedsData();
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (!needsData) return;

    // Initialize Mapbox
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Add main needsData source
      map.addSource('needsData', {
        type: 'geojson',
        data: needsData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster layer
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

      // Add unclustered points
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

      // Add a GeoJSON source for highlighting user's own need
      map.addSource('userNeedHighlight', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [], // Start empty
        },
      });

      // Add a layer to display the highlight
      map.addLayer({
        id: 'user-highlight',
        type: 'circle',
        source: 'userNeedHighlight',
        paint: {
          'circle-radius': 10,
          'circle-color': 'yellow',
          'circle-opacity': 0.5,
        },
      });

      // Update the highlight layer dynamically
      const matchingPoints = needsData.features.filter(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        return isApproxEqual(lng, userLocation.lng) && isApproxEqual(lat, userLocation.lat);
      });

      if (matchingPoints.length > 0) {
        map.getSource('userNeedHighlight').setData({
          type: 'FeatureCollection',
          features: matchingPoints,
        });
      }

      // Event listeners for clusters and points
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('needsData').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }, [needsData, userLocation]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '1024px' }}></div>
    </div>
  );
}

export default NeedsMap;
*/
