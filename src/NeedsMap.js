import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function NeedsMap() {
  const [needsData, setNeedsData] = useState(null);

  // Fetch need data from the server endpoint
  useEffect(() => {
    const fetchNeedsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-need-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Ensure data is loaded correctly
        setNeedsData(data);
      } catch (error) {
        console.error('Error fetching Need Points:', error);
      }
    };

    fetchNeedsData();
  }, []);

  useEffect(() => {
    if (!needsData) return;

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-82.5515, 35.5951], // Centered on Asheville, NC, TODO: replace with user's location.
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
            'Medical supplies', 'blue',
            'Car help', 'red',
            'Financial aid', 'purple',
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
        const { name, need } = e.features[0].properties;

        // Ensure the popup doesn't use stale coordinates
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<span class="popup-name">${name}</span><p class="popup-text"><strong>Need:</strong> ${need}<span><br /><a href="/message">Details</a></span></p><span><a href="/message" class="popup-link">Message</a></span>`)
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
  }, [needsData]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '1024px' }}></div>
    </div>
  );
}

export default NeedsMap;
