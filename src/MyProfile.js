import React, { useState, useEffect } from 'react';
import NonprofitSearch from './NonprofitSearch';

function MyProfile() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [needsNow, setNeedsNow] = useState(false);
  const [geoLocation, setGeoLocation] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'failure'
  const [isStatusVisible, setIsStatusVisible] = useState(false);
  const [isGeolocateClicked, setIsGeolocateClicked] = useState(false); // Track if geolocate is clicked
  const [isNonprofit, setIsNonprofit] = useState(false);
  // auto-search mode nonprofit details
  const [nonprofitName, setNonprofitName] = useState('');
  // toggle to allow manual entry for nonprofit information
  const [isManualNonprofit, setIsManualNonprofit] = useState(false);
  // manual nonprofit fields
  const [manualNonprofitName, setManualNonprofitName] = useState('');
  const [manualNonprofitAddress, setManualNonprofitAddress] = useState('');
  const [manualNonprofitCity, setManualNonprofitCity] = useState('');
  const [manualNonprofitState, setManualNonprofitState] = useState('');
  const [manualNonprofitZip, setManualNonprofitZip] = useState('');
  const [nonprofitEIN, setNonprofitEIN] = useState('');
  const stateAbbreviationMapping = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY"
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/get-profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        console.log('Fetched profile data:', data); // Debug log to verify API response
        console.log('data.u_email');
        console.log(data.u_email);
        // Map the fetched data to state variables
        setEmail(data.u_email || '');
        setFirstName(data.u_firstname || '');
        setLastName(data.u_lastname || '');
        setCity(data.u_city || '');
        setState(data.u_state || '');
        setZip(data.u_zip || '');
        setNeedsNow(data.u_hasneedsnow || false);
        setGeoLocation(data.U_GeoLocation || '');
        setIsNonprofit(!!data.nonprofitname); // Set based on nonprofit data presence
        setNonprofitName(data.nonprofitname || '');
        setManualNonprofitName(data.ManualNonprofitName || '');
        setManualNonprofitAddress(data.ManualNonprofitAddress || '');
        setManualNonprofitCity(data.ManualNonprofitCity || '');
        setManualNonprofitState(data.ManualNonprofitState || '');
        setManualNonprofitZip(data.ManualNonprofitZip || '');
        setNonprofitEIN(data.NonprofitEIN || '');

        console.log('State updated with profile data'); // Debug log to confirm state update
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setStatusMessage('Failed to load profile data.');
        setStatusType('failure');
        setIsStatusVisible(true);
      }
    };

    fetchProfile();
  }, []);

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setGeoLocation(`${latitude},${longitude}`);
          setStatusMessage(`Geolocation successful: ${latitude}, ${longitude}`);
          setStatusType('success');
          setIsStatusVisible(true);
  
          try {
            const response = await fetch(`http://localhost:5002/api/geocode?latitude=${latitude}&longitude=${longitude}`);
            if (!response.ok) {
              throw new Error('Failed to fetch address details');
            }
            const data = await response.json();
            setCity(data.city || '');
            setState(stateAbbreviationMapping[data.state] || '');  // Map state name to its abbreviation
            setZip(data.zip || '');
          } catch (error) {
            console.error('Error fetching address details:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setStatusMessage('Failed to retrieve geolocation.');
          setStatusType('failure');
          setIsStatusVisible(true);
        }
      );
    } else {
      setStatusMessage('Geolocation is not supported by this browser.');
      setStatusType('failure');
      setIsStatusVisible(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!geoLocation) {
      setStatusMessage('Please click "Geolocate Me" to provide your location.');
      setStatusType('failure');
      setIsStatusVisible(true);
      return;
    }

    const userData = {
      U_Email: email,
      U_FirstName: firstName,
      U_LastName: lastName,
      U_City: city,
      U_State: state,
      U_Zip: zip,
      U_HasNeedsNow: needsNow,
      U_RegistrationDate: new Date(),
      U_Active: true,
      U_GeoLocation: geoLocation,
      NonprofitName: nonprofitName,
    };

    try {
      const response = await fetch('http://localhost:5002/api/edit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setStatusMessage('Profile saved successfully!');
        setStatusType('success');
      } else {
        setStatusMessage('Failed to save profile.');
        setStatusType('failure');
      }
      setIsStatusVisible(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatusMessage('Error saving profile.');
      setStatusType('failure');
      setIsStatusVisible(true);
    }
  };

  return (
    <div className="form-container w-full p-6 text-cyan-950">
      <h2 className="text-2xl font-bold">My Profile</h2>
      <div
        id="status"
        className={`${isStatusVisible ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
      <strong>Important: Geolocate Yourself!</strong>
      <p className="nospace">Before proceeding, please click the <strong>"Geolocate Me"</strong> button. This is necessary for the Needs Map to center on your general location, ensuring that you can find nearby needs and resources effectively.</p>
      <form onSubmit={handleSubmit}>
      <div className="form-group flex justify-start mb-4">
        <button type="button" className="bg-green-600 text-white" onClick={handleGeolocate}>Geolocate Me</button>
      </div>
        <div className="form-group">
          <label>E-mail:</label>
          <input type="text" value={email} disabled />
        </div>
        <div className="form-group">
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>City:</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>State:</label>
          <select value={state} onChange={(e) => setState(e.target.value)} required>
            <option value="">Select State</option>
            {Object.entries(stateAbbreviationMapping).map(([stateName, stateAbbreviation]) => (
              <option key={stateAbbreviation} value={stateAbbreviation}>
                {stateName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Zip:</label>
          <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} required />
        </div>
        <div className="form-group">
          <input type="checkbox" checked={needsNow} onChange={(e) => setNeedsNow(e.target.checked)} />I have needs now
        </div>
        <div className="form-group">
            <input
              type="checkbox"
              checked={isNonprofit}
              onChange={(e) => setIsNonprofit(e.target.checked)}
            />
            I am operating as part of a nonprofit helping those in need
        </div>
        {isNonprofit && (
          <div className="nonprofit-section space-y-4 border p-4 rounded">
            {/* Toggle button to switch between auto lookup and manual entry */}
            <div className="form-group">
              <button
                type="button"
                onClick={() => setIsManualNonprofit(prev => !prev)}
                className="text-sm text-blue-600 underline"
              >
                {isManualNonprofit ? "Use Auto Lookup" : "Can't find your nonprofit? Enter manually"}
              </button>
            </div>

            {/* Conditional rendering based on selected mode */}
            {!isManualNonprofit ? (
              <>
                <label>Search for your nonprofit:</label>
                <NonprofitSearch onSelectNonprofit={setNonprofitName} />
                {nonprofitName && (
                  <div>
                    <strong>Selected Nonprofit:</strong> {nonprofitName}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Nonprofit Name:</label>
                  <input
                    type="text"
                    value={manualNonprofitName}
                    onChange={(e) => setManualNonprofitName(e.target.value)}
                    placeholder="Enter Nonprofit Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nonprofit Address:</label>
                  <input
                    type="text"
                    value={manualNonprofitAddress}
                    onChange={(e) => setManualNonprofitAddress(e.target.value)}
                    placeholder="Enter Nonprofit Address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nonprofit City:</label>
                  <input
                    type="text"
                    value={manualNonprofitCity}
                    onChange={(e) => setManualNonprofitCity(e.target.value)}
                    placeholder="Enter Nonprofit City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nonprofit State:</label>
                  <select
                    value={manualNonprofitState}
                    onChange={(e) => setManualNonprofitState(e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {Object.entries(stateAbbreviationMapping).map(([stateName, stateAbbreviation]) => (
                      <option key={stateAbbreviation} value={stateAbbreviation}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nonprofit Zip:</label>
                  <input
                    type="text"
                    value={manualNonprofitZip}
                    onChange={(e) => setManualNonprofitZip(e.target.value)}
                    placeholder="Enter Nonprofit Zip"
                    required
                  />
                </div>
              </>
            )}

            {/* Nonprofit EIN Field: always required in nonprofit mode */}
            <div className="form-group">
              <label>Nonprofit EIN:</label>
              <input
                type="text"
                value={nonprofitEIN}
                onChange={(e) => setNonprofitEIN(e.target.value)}
                placeholder="Enter Nonprofit EIN"
                required
              />
            </div>
          </div>
        )}
        
        <div className="form-group flex justify-start mt-4">
          <label></label>    
          <button type="submit">Save Profile</button>
        </div>
      </form>
    </div>
  );
}

export default MyProfile;
