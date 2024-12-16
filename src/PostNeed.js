import React, { useState, useEffect } from 'react';
/*
function PostNeed() {
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState('');
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  useEffect(() => {
    // Fetch active needs from the backend
    const fetchNeeds = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/active-needs');
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      need: selectedNeed,
      description: description,
    };

    try {
      const response = await fetch('http://localhost:5000/api/post-need', {
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
    <div className="form-container p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Post Your Need</h2>
      <div
        id="status"
        className={`${statusMessage ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Need:</label>
          <select name="N_ID"
            value={selectedNeed}
            onChange={(e) => setSelectedNeed(e.target.value)}
            required
          >
            <option value="" disabled>Select a need</option>
            {needs.map((need) => (
              <option key={need.n_id} value={need.n_id}>{need.n_title}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Describe Your Need:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength="500"
            required
          />
        </div>
        <div className="form-group flex justify-start ml-4 mt-4">
          <label></label>
          <button type="submit">Post Need</button>
        </div>
      </form>
    </div>
  );
}

export default PostNeed;
*/

function PostNeed() {
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState('');
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    // Fetch active needs from the backend
    const fetchNeeds = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/active-needs');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      need: selectedNeed,
      description: description,
      geoLocation: `${geoLocation.latitude},${geoLocation.longitude}`, // Combine latitude and longitude
    };

    try {
      const response = await fetch('http://localhost:5000/api/post-need', {
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
    <div className="form-container p-6 space-y-6 text-cyan-950">
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
    <label htmlFor="description">Describe Your Need:</label>
    <textarea
      id="description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      maxLength="500"
      required
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
  <div className="form-group-button">
    <button
      type="submit"
      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
    >
      Post Need
    </button>
  </div>
</form>

    </div>
  );
}

export default PostNeed;
