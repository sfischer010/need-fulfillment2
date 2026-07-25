import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

declare const process: {
  env: {
    REACT_APP_MAPBOX_TOKEN: string;
  };
};

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

// Types for backend data
interface Need {
  n_id: string;
  n_title: string;
}

interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
}

interface SearchSuggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
  place_formatted: string;
  feature_type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const PostNeed: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'failure' | ''>('');
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({
    latitude: null,
    longitude: null,
  });
  const [differentLocation, setDifferentLocation] = useState<boolean>(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SearchSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [justSelected, setJustSelected] = useState<boolean>(false);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/active-needs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Need[] = await response.json();
        setNeeds(data);
      } catch (error) {
        console.error('Error fetching needs:', error);
      }
    };

    fetchNeeds();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    }

    // Generate a session token for Search Box API billing
    setSessionToken(generateSessionToken());
  }, []);

  const generateSessionToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    // Don't search if we just selected something
    if (justSelected) {
      return;
    }
    
    if (!locationSearchQuery || locationSearchQuery.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchForPlaces(locationSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationSearchQuery, geoLocation, justSelected]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);


  const searchForPlaces = async (query: string) => {
    setIsSearching(true);
    try {
      const proximityParam = geoLocation.latitude && geoLocation.longitude
        ? `&proximity=${geoLocation.longitude},${geoLocation.latitude}`
        : '';

      // Use Search Box API /suggest endpoint
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          query
        )}&language=en&limit=10${proximityParam}&session_token=${sessionToken}&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      console.log('Search Box API response:', data);

      if (data.suggestions && data.suggestions.length > 0) {
        const suggestions: SearchSuggestion[] = data.suggestions.map((suggestion: any) => ({
          mapbox_id: suggestion.mapbox_id,
          name: suggestion.name,
          full_address: suggestion.full_address || suggestion.place_formatted || '',
          place_formatted: suggestion.place_formatted || '',
          feature_type: suggestion.feature_type || 'unknown',
          coordinates: {
            latitude: 0, // Will be filled after retrieve
            longitude: 0,
          },
        }));
        
        setSearchSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching for places:', error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const retrieveLocationDetails = async (mapboxId: string) => {
    try {
      // Use Search Box API /retrieve endpoint to get full details
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${sessionToken}&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      console.log('Retrieve API response:', data);

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          coordinates: {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          },
          name: feature.properties.name,
          full_address: feature.properties.full_address || feature.properties.place_formatted,
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving location details:', error);
      return null;
    }
  };

  const handleLocationSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationSearchQuery(value);
    setSelectedLocation(null);
    setJustSelected(false); // Reset the flag when user starts typing
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = async (suggestion: SearchSuggestion) => {
    console.log('Selected suggestion:', suggestion);
    
    // Close suggestions immediately
    setShowSuggestions(false);
    
    // Retrieve full details including coordinates
    const details = await retrieveLocationDetails(suggestion.mapbox_id);
    
    if (details) {
      const fullLocation: SearchSuggestion = {
        ...suggestion,
        coordinates: details.coordinates,
        name: details.name,
        full_address: details.full_address,
      };
      
      setSelectedLocation(fullLocation);
      setLocationSearchQuery(fullLocation.name);
      setJustSelected(true); // Set flag to prevent re-searching
      
      // Generate new session token for next search
      setSessionToken(generateSessionToken());
    }
  };

  const handleCheckboxChange = () => {
    setDifferentLocation(!differentLocation);
    if (differentLocation) {
      // Reset location search when unchecking
      setLocationSearchQuery('');
      setSelectedLocation(null);
      setSearchSuggestions([]);
      setSessionToken(generateSessionToken());
      setJustSelected(false);
    }
  };

  const handleFormSubmit = async () => {
    let coordinates: string | null = null;
    let locationName: string | null = null;

    if (differentLocation) {
      if (!selectedLocation) {
        setStatusMessage('Please select a location from the suggestions.');
        setStatusType('failure');
        return;
      }

      coordinates = `${selectedLocation.coordinates.latitude},${selectedLocation.coordinates.longitude}`;
      locationName = selectedLocation.name;
    } else {
      if (geoLocation.latitude === null || geoLocation.longitude === null) {
        setStatusMessage('Unable to get your current location.');
        setStatusType('failure');
        return;
      }
      coordinates = `${geoLocation.latitude},${geoLocation.longitude}`;
    }

    if (!selectedNeed) {
      setStatusMessage('Please select a need.');
      setStatusType('failure');
      return;
    }

    if (!description) {
      setStatusMessage('Please provide a description.');
      setStatusType('failure');
      return;
    }

    const postData = {
      need: selectedNeed,
      description,
      geoLocation: coordinates,
      locationName: locationName,
    };

    try {
      const response = await fetch('http://localhost:5002/api/post-need', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setStatusMessage('Need posted successfully!');
        setStatusType('success');
        setSelectedNeed('');
        setDescription('');
        setDifferentLocation(false);
        setLocationSearchQuery('');
        setSelectedLocation(null);
        setSearchSuggestions([]);
        setSessionToken(generateSessionToken());
      } else {
        setStatusMessage('Failed to post need.');
        setStatusType('failure');
      }
    } catch (error) {
      console.error('Error posting need:', error);
      setStatusMessage('Error posting need.');
      setStatusType('failure');
    }
  };

  return (
    <div id="post-need" className="form-container p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Post Your Need</h2>
      <div
        id="status"
        className={`${statusMessage ? '' : 'hidden'} ${
          statusType === 'success'
            ? 'bg-green-100 text-green-700 p-2 rounded'
            : 'bg-red-100 text-red-700 p-2 rounded'
        }`}
      >
        {statusMessage}
      </div>
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="need">Select Need:</label>
          <select
            id="need"
            value={selectedNeed}
            onChange={(e) => setSelectedNeed(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>
              -Select a need-
            </option>
            {needs.map((need) => (
              <option key={need.n_id} value={need.n_id}>
                {need.n_title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Describe Need:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="form-group col-span-2">
          <input
            type="checkbox"
            checked={differentLocation}
            onChange={handleCheckboxChange}
          />
          <span className="ml-2">I want to meet somewhere different than my current location.</span>
        </div>
        {differentLocation && (
          <div className="location-search border p-4 mt-4 rounded" ref={searchContainerRef}>
            <div className="form-group relative">
              <label htmlFor="location-search" className="block mb-2 font-medium">
                Search for a Location
              </label>
              <input
                id="location-search"
                type="text"
                value={locationSearchQuery}
                onChange={handleLocationSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Starbucks, Ingles, 123 Main St"
                className="w-full p-2 border border-gray-300 rounded"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-11 text-gray-400">
                  Searching...
                </div>
              )}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.mapbox_id}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-cyan-950 flex items-center gap-2">
                        {suggestion.feature_type === 'poi' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">POI</span>
                        )}
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {suggestion.full_address || suggestion.place_formatted}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && searchSuggestions.length === 0 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 text-gray-500">
                  No locations found. Try a different search.
                </div>
              )}
            </div>

            {selectedLocation && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-800">Selected Location:</div>
                <div className="text-sm text-green-700">{selectedLocation.name}</div>
                <div className="text-xs text-green-600 mt-1">
                  {selectedLocation.full_address}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="form-group flex justify-start ml-4 mt-4">
          <button 
            type="button"
            onClick={handleFormSubmit}
            className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
          >
            Post Need
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostNeed;