import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw';

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

function PostNeed() {
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState('');
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null });
  const [differentLocation, setDifferentLocation] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
      address: '',
      city: '',
      state: '',
      zip: ''
  });

  useEffect(() => {
    // Fetch active needs from the backend
    const fetchNeeds = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/active-needs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNeeds(data);
      } catch (error) {
        console.error('Error fetching needs:', error);
      }
    };

    fetchNeeds();

    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGeoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }, (error) => {
        console.error('Error getting geolocation:', error);
      });
    }
  }, []);

  const handleCheckboxChange = () => {
    setDifferentLocation(!differentLocation);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let coordinates;
    if (differentLocation) {
      coordinates = await getGeocoordinates(locationDetails);
    } else {
      coordinates = `${geoLocation.latitude},${geoLocation.longitude}`; // Combine latitude and longitude
    }

    const postData = {
      need: selectedNeed,
      description: description,
      geoLocation: coordinates
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
        setLocationDetails({
          address: '',
          city: '',
          state: '',
          zip: ''
        });
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
  
  const getGeocoordinates = async (locationDetails) => {
    const address = `${locationDetails.address}, ${locationDetails.city}, ${locationDetails.state}, ${locationDetails.zip}`;
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`);
    const data = await response.json();

    if (data.features.length > 0) {
      const location = data.features[0].geometry.coordinates;
      return `${location[1]},${location[0]}`;
    } else {
      console.error('Error fetching geocoordinates:', data.message);
      return null;
    }
  };

  return (
    <div id="post-need" className="form-container p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Post Your Need</h2>
      <div
        id="status"
        className={`${statusMessage ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="need">Select Need:</label>
          <select
            id="need"
            value={selectedNeed}
            onChange={(e) => setSelectedNeed(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
      <option value="" disabled>Select a need</option>
      {needs.map((need) => (
        <option key={need.n_id} value={need.n_id}>{need.n_title}</option>
      ))}
    </select>
  </div>
  <div className="form-group">
    <label htmlFor="description">Describe Need:</label>
    <textarea
      id="description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      maxLength="500"
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
      I want to meet somewhere different than my current location.
  </div>
  {differentLocation && (
    <div className="location-details border p-4 mt-4">
      <div className="form-group">
        <label>Address</label>
          <input 
            type="text" 
            name="address" 
            value={locationDetails.address} 
            onChange={handleInputChange} 
            className="form-control w-full"
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input 
            type="text" 
            name="city" 
            value={locationDetails.city} 
            onChange={handleInputChange} 
            className="form-control w-full"
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <select
            name="state"
            value={locationDetails.state}
            onChange={handleInputChange}
            className="form-control w-full"
          >
            <option value="" disabled>Select a state</option>
            {states.map((state, index) => (
              <option key={index} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Zip</label>
          <input 
            type="text" 
            name="zip" 
            value={locationDetails.zip} 
            onChange={handleInputChange} 
            className="form-control w-full"
          />
        </div>
      </div>
      )}
      <div className="form-group flex justify-start ml-4 mt-4">
        <label></label>
        <button type="submit">Post Need</button>
      </div>
  </form>
 </div>
  );
}

export default PostNeed;
