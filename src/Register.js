import React, { useState } from 'react';
import NonprofitSearch from './NonprofitSearch';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [orgName, setOrgName] = useState('');
  const [needsNow, setNeedsNow] = useState(false);
  const [geoLocation, setGeoLocation] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'failure'
  const [isStatusVisible, setIsStatusVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isGeolocateClicked, setIsGeolocateClicked] = useState(false); // Track if geolocate is clicked
  const [isNonprofit, setIsNonprofit] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Track if the user has registered successfully
  // auto-search mode nonprofit details
  const [nonprofitName, setNonprofitName] = useState('');
  const [nonprofitDescription, setNonprofitDescription] = useState(''); // Nonprofit description field
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

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      setPasswordError('Password must contain at least one letter, one number, and one special character.');
      return;
    } else {
      setPasswordError('');
    }

    // Determine the correct orgName and nonprofit details
    let finalOrgName = orgName;
    let nonprofitDetails = {};

    if (isNonprofit) {
      if (isManualNonprofit) {
        finalOrgName = manualNonprofitName;
        nonprofitDetails = {
          address: manualNonprofitAddress,
          city: manualNonprofitCity,
          state: manualNonprofitState,
          zip: manualNonprofitZip,
          ein: nonprofitEIN,
        };
      } else {
        nonprofitDetails = {
          description: nonprofitDescription,
          ein: nonprofitEIN,
        };
      }
    }

    const userData = {
      U_Email: email,
      U_Password: password,
      U_FirstName: firstName,
      U_LastName: lastName,
      U_City: city,
      U_State: state,
      U_Zip: zip,
      U_HasNeedsNow: needsNow,
      U_RegistrationDate: new Date(),
      U_Active: true,
      U_GeoLocation: geoLocation,
      orgName: finalOrgName, // Include the correct orgName
      ...nonprofitDetails, // Spread nonprofit details into the userData object
    };

    try {
      const response = await fetch('http://localhost:5002/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setStatusMessage('Registered successfully! Please check your email to verify your account.');
        setStatusType('success');
        setIsRegistered(true); // Set the registration status to true
      } else {
        setStatusMessage('Failed to register user.');
        setStatusType('failure');
      }
      setIsStatusVisible(true);
    } catch (error) {
      console.error('Error registering user:', error);
      setStatusMessage('Error registering user.');
      setStatusType('failure');
      setIsStatusVisible(true);
    }
  };

  return (
    <div className="form-container w-full p-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Registration</h2>
      <div
        id="status"
        className={`${isStatusVisible ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
      <div className="terms-blurb text-sm mt-4">
        <p>
          By registering, you agree to our{" "}
          <a
            href="/terms-of-service"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Terms of Service
        </a>.
      </p>
    </div>
      {!isRegistered && ( // Hide the form if the user has registered successfully
        <>
          <strong>Important: Geolocate Yourself!</strong>
          <p className="nospace">Before proceeding, please click the <strong>"Geolocate Me"</strong> button. This is necessary for the Needs Map to center on your general location, ensuring that you can find nearby needs and resources effectively.</p>
          <form onSubmit={handleSubmit}>
          <div className="form-group flex justify-start mb-4">
            <button type="button" className="bg-green-600 text-white" onClick={handleGeolocate}>Geolocate Me</button>
          </div>
            <div className="form-group">
              <label>E-mail (this will be your username):</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="w-1/3">Password:</label>
              <div className="w-2/3 flex flex-col">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {passwordError && <p className="text-red-500 mt-1">{passwordError}</p>}
              </div>
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
              <div className="nonprofit-section space-y-6 border p-6 rounded-lg w-full mx-auto bg-gray-50">
                {/* Toggle button to switch between auto lookup and manual entry */}
                <div className="form-group text-center">
                  <button
                    type="button"
                    onClick={() => setIsManualNonprofit((prev) => !prev)}
                    className="text-sm text-blue-600 underline"
                  >
                    {isManualNonprofit ? "Use Auto Lookup" : "Can't find your nonprofit? Enter manually"}
                  </button>
                </div>

                {/* Conditional rendering based on selected mode */}
                {!isManualNonprofit ? (
                    <div>
                  <div className="form-group mb-4">
                      <strong><label>Search for your nonprofit:</label></strong>
                    </div>
                    <NonprofitSearch 
                      onSelectNonprofit={(selectedName) => {
                        console.log("Selected Nonprofit:", selectedName); // Debug log
                        setOrgName(selectedName); // Ensure orgName is updated
                      }} 
                    />
                    {orgName && (
                      <div className="mt-4">
                        <strong>Selected Nonprofit:</strong> {orgName}
                      </div>
                    )}
                    <div className="form-group mt-4">
                      <label className="block mb-1">Description:</label>
                      <textarea
                        value={nonprofitDescription}
                        onChange={(e) => setNonprofitDescription(e.target.value)}
                        placeholder="Enter Nonprofit Description"
                        required
                        maxLength="255"
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="form-group mt-4">
                      <label className="block mb-1">EIN:</label>
                      <input
                        type="text"
                        value={nonprofitEIN}
                        onChange={(e) => setNonprofitEIN(e.target.value)}
                        placeholder="Enter Nonprofit EIN"
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="manual-nonprofit-inputs">
                    <div className="form-group">
                      <label className="block mb-1">Nonprofit Name:</label>
                      <input
                        type="text"
                        value={manualNonprofitName}
                        onChange={(e) => setManualNonprofitName(e.target.value)}
                        placeholder="Enter Nonprofit Name"
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block mb-1">Nonprofit Address:</label>
                      <input
                        type="text"
                        value={manualNonprofitAddress}
                        onChange={(e) => setManualNonprofitAddress(e.target.value)}
                        placeholder="Enter Nonprofit Address"
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block mb-1">Nonprofit City:</label>
                      <input
                        type="text"
                        value={manualNonprofitCity}
                        onChange={(e) => setManualNonprofitCity(e.target.value)}
                        placeholder="Enter Nonprofit City"
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block mb-1">Nonprofit State:</label>
                      <select
                        value={manualNonprofitState}
                        onChange={(e) => setManualNonprofitState(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
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
                      <label className="block mb-1">Nonprofit Zip:</label>
                      <input
                        type="text"
                        value={manualNonprofitZip}
                        onChange={(e) => setManualNonprofitZip(e.target.value)}
                        placeholder="Enter Nonprofit Zip"
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block mb-1">Nonprofit EIN:</label>
                      <input
                        type="text"
                        value={nonprofitEIN}
                        onChange={(e) => setNonprofitEIN(e.target.value)}
                        placeholder="Enter Nonprofit EIN"
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="form-group flex justify-start mt-4">
              <label></label>    
              <button type="submit">Register</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default Register;
