import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [passwordError, setPasswordError] = useState('');
  const [isGeolocateClicked, setIsGeolocateClicked] = useState(false); // Track if geolocate is clicked

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
        setStatusMessage('User registered successfully!');
        setStatusType('success');
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
    <div className="form-container w-full p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Registration</h2>
      <div
        id="status"
        className={`${isStatusVisible ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
      <strong>Important: Geolocate Yourself!</strong>
      <p className="nospace">Before proceeding, please click the <strong>"Geolocate Me"</strong> button. This is necessary for the Needs Map to center on your general location, ensuring that you can find nearby needs and resources effectively.</p>
      <form onSubmit={handleSubmit}>
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
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
        </div>
        <div className="form-group">
          <label>Zip:</label>
          <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} required />
        </div>
        <div className="form-group">
          <label></label>       
          <input type="checkbox" checked={needsNow} onChange={(e) => setNeedsNow(e.target.checked)} />I have needs now
        </div>
        <div className="form-group flex justify-start mt-4">
          <label></label>    
          <button type="button" onClick={handleGeolocate}>Geolocate Me</button>
        </div>
        <div className="form-group flex justify-start mt-4">
          <label></label>    
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
}

export default Register;
