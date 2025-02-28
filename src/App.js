import React, { useState } from "react";

const airportOptions = [
  { code: "LHR", name: "London Heathrow" },
  { code: "JFK", name: "John F. Kennedy International" },
  { code: "LAX", name: "Los Angeles International" },
  { code: "DXB", name: "Dubai International" },
  { code: "HND", name: "Tokyo Haneda" },
  { code: "CDG", name: "Paris Charles de Gaulle" },
  { code: "AMS", name: "Amsterdam Schiphol" },
  { code: "FRA", name: "Frankfurt Airport" },
  { code: "SIN", name: "Singapore Changi" },
  { code: "PEK", name: "Beijing Capital International" },
  { code: "SYD", name: "Sydney Airport" },
  { code: "YYZ", name: "Toronto Pearson" },
  { code: "BCN", name: "Barcelona El Prat" },
  { code: "MUC", name: "Munich Airport" },
  { code: "ZRH", name: "Zurich Airport" },
  { code: "ICN", name: "Seoul Incheon" },
  { code: "BKK", name: "Bangkok Suvarnabhumi" },
  { code: "AUH", name: "Abu Dhabi International" },
  { code: "MAD", name: "Madrid Barajas" },
  { code: "IST", name: "Istanbul Airport" },
  { code: "ORD", name: "Chicago O'Hare International" },
  { code: "ATL", name: "Atlanta Hartsfield-Jackson" },
  { code: "DFW", name: "Dallas/Fort Worth International" },
  { code: "DEN", name: "Denver International" },
  { code: "SFO", name: "San Francisco International" },
  { code: "MIA", name: "Miami International" },
  { code: "LGW", name: "London Gatwick" },
  { code: "FCO", name: "Rome Fiumicino" },
  { code: "MEL", name: "Melbourne Airport" },
  { code: "YVR", name: "Vancouver International" },
  { code: "CPH", name: "Copenhagen Airport" },
  { code: "VIE", name: "Vienna International" },
  { code: "HKG", name: "Hong Kong International" },
  { code: "KUL", name: "Kuala Lumpur International" },
  { code: "DOH", name: "Doha Hamad International" },
  { code: "GRU", name: "São Paulo Guarulhos" },
  { code: "MEX", name: "Mexico City International" },
  { code: "ARN", name: "Stockholm Arlanda" },
  { code: "OSL", name: "Oslo Airport" },
  { code: "HEL", name: "Helsinki-Vantaa" }
];
const Navbar = () => (
  <nav className="w-full bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between">
    <h1 className="text-2xl font-light tracking-tight text-gray-900">TripTailor</h1>
  </nav>
);

const Footer = () => (
  <footer className="w-full bg-white border-t border-gray-200 text-gray-500 text-center py-6 mt-6">
    <p className="text-sm">&copy; 2025 TripTailor. All rights reserved.</p>
  </footer>
);

const FlightSearch = () => {
  const formRef = React.useRef(null);
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [origin, setOrigin] = useState(airportOptions[0].code);
  const [destination, setDestination] = useState(airportOptions[1].code);
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [preferences, setPreferences] = useState("");
  const [flights, setFlights] = useState([]);
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [flightLoading, setFlightLoading] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);

  const fetchFlights = async () => {
    setLoading(true);
    setFlightLoading(true);
    setItineraryLoading(true);
    setFlights([]);
    setItinerary("");
    
    const clientId = process.env.REACT_APP_AMADEUS_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_AMADEUS_CLIENT_SECRET;

    // Calculate number of days
    const departureDate = new Date(date);
    const returnDay = new Date(returnDate);
    const tripDuration = returnDate ? Math.ceil((returnDay - departureDate) / (1000 * 60 * 60 * 24)) : 1;

    try {
      // Get authentication token
      const tokenResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch available flights
      const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}${returnDate ? `&returnDate=${returnDate}` : ''}&adults=1&max=2`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      const data = await response.json();
      setFlights(data.data || []);
      setFlightLoading(false);
      
      // Fetch itinerary from Cohere API
      const cohereApiKey = process.env.REACT_APP_COHERE_API_KEY;
      const itineraryResponse = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cohereApiKey}`
        },
        body: JSON.stringify({
          model: "command",
          prompt: `Create a detailed ${tripDuration}-day travel itinerary for a trip to ${destination}${preferences ? ` focusing on ${preferences}` : ''}. For each day, structure the response as follows:

${Array.from({ length: tripDuration }, (_, i) => `Day ${i + 1}:
Morning:
- Activities and places to visit with important locations in bold

Afternoon:
- Activities and places to visit with important locations in bold

Evening:
- Activities and places to visit with important locations in bold
`).join('\n')}

Include popular attractions, recommended restaurants, and local transportation tips. Format important locations and places in bold using **location name** syntax.`,
          max_tokens: 2000,
          temperature: 0.7,
          k: 0,
          stop_sequences: [],
          return_likelihoods: "NONE"
        })
      });
      
      const itineraryData = await itineraryResponse.json();
      const generatedText = itineraryData.generations?.[0]?.text || "No itinerary available.";
      setItinerary(generatedText);
    } catch (error) {
      console.error("Error fetching flights or itinerary:", error);
    }
    setLoading(false);
    setFlightLoading(false);
    setItineraryLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans transition-all duration-500 ease-in-out">
      <Navbar />
      <div className="flex-grow flex flex-col items-center gap-8">
        <div className="w-full bg-[url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070')] bg-cover bg-center bg-no-repeat py-48 px-8 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
          <div className="relative z-10">
            <h1 className="text-6xl font-bold text-white mb-6 hero-title">Travel Made Simple</h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto hero-subtitle">Discover your next adventure with personalized flight recommendations and AI-powered travel itineraries.</p>
            <button
              onClick={scrollToForm}
              className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out transform hero-button"
            >
              Plan Your Trip
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 transform transition-all duration-500 hover:scale-105 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 14l-3-3h-7a1 1 0 01-1-1V4a1 1 0 00-1-1H3a1 1 0 00-1 1v12a1 1 0 001 1h11a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1v-7a1 1 0 00-.293-.707z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Smart Flight Search</h3>
              <p className="text-gray-600 max-w-sm">Find the perfect flights with our intelligent search algorithm that considers your preferences and budget.</p>
            </div>
            <div className="text-center p-8 transform transition-all duration-500 hover:scale-105 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Travel Planning</h3>
              <p className="text-gray-600 max-w-sm">Let our AI create personalized itineraries based on your interests and travel style.</p>
            </div>
            <div className="text-center p-8 transform transition-all duration-500 hover:scale-105 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Global Coverage</h3>
              <p className="text-gray-600 max-w-sm">Access flights and destinations worldwide with our comprehensive travel network.</p>
            </div>
          </div>
        </div>


        {/* Why Choose Us Section */}
        <div className="w-full py-32 px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-semibold text-center mb-24 tracking-tight">Why TripTailor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="group p-8 transition-all duration-500 hover:bg-gray-50 rounded-3xl">
                <div className="mb-6">
                  <svg className="w-12 h-12 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Personalized Experience</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Every journey is uniquely crafted to match your individual preferences and travel aspirations.</p>
              </div>
              <div className="group p-8 transition-all duration-500 hover:bg-gray-50 rounded-3xl">
                <div className="mb-6">
                  <svg className="w-12 h-12 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Experience instant flight options and AI-powered travel plans in mere seconds.</p>
              </div>
              <div className="group p-8 transition-all duration-500 hover:bg-gray-50 rounded-3xl">
                <div className="mb-6">
                  <svg className="w-12 h-12 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Best Value</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Discover competitive flight prices and smart travel recommendations that maximize your budget.</p>
              </div>
              <div className="group p-8 transition-all duration-500 hover:bg-gray-50 rounded-3xl">
                <div className="mb-6">
                  <svg className="w-12 h-12 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Secure Booking</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Book with complete confidence using our secure and encrypted platform.</p>
              </div>
            </div>
          </div>
        </div>
        <div ref={formRef} className="max-w-4xl w-full p-12 bg-white mx-8 backdrop-blur-md bg-opacity-90">
          <h1 className="text-4xl font-light text-center mb-12">Find Your Perfect Flight</h1>
          <div className="space-y-6">
            <div className="group relative">
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-3 text-lg bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-all duration-300 appearance-none rounded-none"
              >
                {airportOptions.map((airport) => (
                  <option key={airport.code} value={airport.code}>{airport.name} ({airport.code})</option>
                ))}
              </select>
              <label className="absolute left-4 -top-2 text-xs text-gray-500">From</label>
            </div>
            <div className="group relative">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 text-lg bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-all duration-300 appearance-none rounded-none"
              >
                {airportOptions.map((airport) => (
                  <option key={airport.code} value={airport.code}>{airport.name} ({airport.code})</option>
                ))}
              </select>
              <label className="absolute left-4 -top-2 text-xs text-gray-500">To</label>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="group relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 text-lg bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-all duration-300 rounded-none"
                />
                <label className="absolute left-4 -top-2 text-xs text-gray-500">Departure</label>
              </div>
              <div className="group relative">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-4 py-3 text-lg bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-all duration-300 rounded-none"
                  min={date}
                />
                <label className="absolute left-4 -top-2 text-xs text-gray-500">Return</label>
              </div>
            </div>
            <div className="group relative">
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="What interests you?"
                className="w-full px-4 py-3 text-lg bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:ring-0 transition-all duration-300 rounded-none"
              />
              <label className="absolute left-4 -top-2 text-xs text-gray-500">Interests</label>
            </div>
            <button
              onClick={fetchFlights}
              className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-4 text-lg font-light tracking-wide hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out relative"
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Planning your trip...
                  </>
                ) : (
                  'Continue →'
                )}
              </span>
            </button>
          </div>
        </div>

        {(flights.length > 0 || itinerary) && (
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 px-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg backdrop-blur-md bg-opacity-95 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-3xl font-light mb-8 text-gray-900">Available Flights</h2>
              <div className="space-y-6">
                {flightLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    {flights.map((flight, index) => (
                      <div key={index} className="border-0 bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300">
                        {/* Outbound Flight */}
                        <div className="mb-6">
                          <h3 className="text-xl font-medium mb-4 text-gray-900">Outbound Flight</h3>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-medium text-gray-900">
                              {flight.itineraries[0].segments[0].departure.iataCode} → {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
                            </span>
                            <span className="text-xl font-medium text-gray-900">{flight.price.total} {flight.price.currency}</span>
                          </div>
                          {flight.itineraries[0].segments.map((segment, segIndex) => (
                            <div key={segIndex} className="text-sm text-gray-600 ml-4">
                              <p>Flight: {segment.carrierCode} {segment.number}</p>
                              <p>Departure: {new Date(segment.departure.at).toLocaleString()}</p>
                              <p>Arrival: {new Date(segment.arrival.at).toLocaleString()}</p>
                              {segIndex < flight.itineraries[0].segments.length - 1 && (
                                <div className="my-2 border-l-2 border-gray-300 pl-4">
                                  <p className="text-orange-600">Layover at {segment.arrival.iataCode}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Return Flight (if exists) */}
                        {flight.itineraries[1] && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-semibold mb-2">Return Flight</h3>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold">
                                {flight.itineraries[1].segments[0].departure.iataCode} → {flight.itineraries[1].segments[flight.itineraries[1].segments.length - 1].arrival.iataCode}
                              </span>
                            </div>
                            {flight.itineraries[1].segments.map((segment, segIndex) => (
                              <div key={segIndex} className="text-sm text-gray-600 ml-4">
                                <p>Flight: {segment.carrierCode} {segment.number}</p>
                                <p>Departure: {new Date(segment.departure.at).toLocaleString()}</p>
                                <p>Arrival: {new Date(segment.arrival.at).toLocaleString()}</p>
                                {segIndex < flight.itineraries[1].segments.length - 1 && (
                                  <div className="my-2 border-l-2 border-gray-300 pl-4">
                                    <p className="text-orange-600">Layover at {segment.arrival.iataCode}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {flights.length === 0 && <p className="text-gray-500">No flights found for the selected criteria.</p>}
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-xl overflow-hidden">
              <h2 className="text-2xl font-semibold mb-4">Travel Itinerary</h2>
              <div className="prose prose-sm max-w-none">
                {itineraryLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  itinerary ? (
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                      {itinerary.split('**').map((part, index) => 
                        index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                      )}
                    </pre>
                  ) : (
                    <p className="text-gray-500">Select your destination and search for flights to get a personalized travel itinerary.</p>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FlightSearch;
