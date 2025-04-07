import { useState, useRef, useEffect } from "react";

const NonprofitSearch = ({ onSelectNonprofit }) => { // Accept onSelectNonprofit as a prop
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Ensure we have a string value
      const safeSearchTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";
      console.log("Fetching suggestions for:", safeSearchTerm);
      if (safeSearchTerm !== "") {
        fetch(`http://localhost:5002/api/nonprofits?q=${encodeURIComponent(safeSearchTerm)}`)
          .then((response) => response.json())
          .then((data) => {
            setSuggestions(data.organizations || []);
          })
          .catch((error) => {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    setSearchTerm(suggestion.name);
    setSuggestions([]);
    if (onSelectNonprofit) {
      onSelectNonprofit(suggestion.name); // Pass the selected nonprofit name to the parent
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    console.log("Input changed:", val);
    setSearchTerm(val);
  };

  return (
    <div className="form-group relative" ref={containerRef}>
      <label htmlFor="nonprofitSearch" className="block mb-1">
        Nonprofit Name:
      </label>
      <input
        type="text"
        id="nonprofitSearch"
        name="orgName"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Enter nonprofit name"
        className="w-full border rounded px-3 py-2"
      />
      {suggestions?.length > 0 && (
        <ul className="absolute mt-2 w-full bg-white border rounded shadow-lg z-10 max-h-40 overflow-y-auto">
          {suggestions.map((nonprofit, index) => (
            <li
              key={index}
              onClick={() => handleSelect(nonprofit)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {nonprofit.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NonprofitSearch;