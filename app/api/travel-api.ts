// SerpAPI client for travel-related searches
"use server"

const SERP_API_KEY = process.env.SERP_API_KEY;

if (!SERP_API_KEY) {
  throw new Error("SERP_API_KEY is not set in environment variables.");
}

const SERP_API_BASE_URL = 'https://serpapi.com/search.json';

export async function searchFlights({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  returnDate,
  adults = 1
}: {
  originLocationCode: string
  destinationLocationCode: string
  departureDate: string
  returnDate: string
  adults?: number
}) {
  try {
    // Validate location codes (basic validation)
    if (originLocationCode.length !== 3 || destinationLocationCode.length !== 3) {
      throw new Error('Invalid location code. Please use 3-letter IATA airport codes.');
    }

    // Validate dates
    const currentDate = new Date();
    const departureDateObj = new Date(departureDate);
    const returnDateObj = new Date(returnDate);

    if (isNaN(departureDateObj.getTime()) || isNaN(returnDateObj.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
    }

    if (departureDateObj < currentDate) {
      throw new Error('Departure date cannot be in the past.');
    }

    if (returnDateObj < departureDateObj) {
      throw new Error('Return date must be after departure date.');
    }

    const params = new URLSearchParams();
    params.append('engine', 'google_flights');
    params.append('departure_id', originLocationCode.toUpperCase());
    params.append('arrival_id', destinationLocationCode.toUpperCase());
    params.append('outbound_date', departureDate);
    params.append('return_date', returnDate);
    params.append('adults', adults.toString());
    params.append('currency', 'USD');
    params.append('api_key', SERP_API_KEY);
    params.append('hl', 'en');
    params.append('gl', 'us');

    const response = await fetch(`${SERP_API_BASE_URL}?${params}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const flights = data.flights_results || [];
    
    if (flights.length === 0) {
      console.log('No flights found for the given criteria');
    }

    return flights;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

export async function searchHotels({
  cityCode,
  checkInDate,
  checkOutDate,
  adults = 1,
  radius = 5,
  radiusUnit = 'KM',
  ratings = ['3', '4', '5']
}: {
  cityCode: string
  checkInDate: string
  checkOutDate: string
  adults?: number
  radius?: number
  radiusUnit?: string
  ratings?: string[]
}) {
  try {
    const params = new URLSearchParams({
      engine: 'google_hotels',
      q: `hotels in ${cityCode}`,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: adults.toString(),
      currency: 'USD',
      api_key: SERP_API_KEY
    });

    const response = await fetch(`${SERP_API_BASE_URL}?${params}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.hotels_results || [];
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}