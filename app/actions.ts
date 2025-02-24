"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { searchFlights } from "./api/travel-api"

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables")
}

const genAI = new GoogleGenerativeAI(apiKey)

export async function planTrip({
  departure,
  destination,
  startDate,
  endDate,
  activities,
}: {
  departure: string
  destination: string
  startDate: string
  endDate: string
  activities: string
}) {
  try {
    // Search for available flights
    let flightInfo = "No flight information available."
    try {
      const flights = await searchFlights({
        originLocationCode: departure.slice(0, 3).toUpperCase(),
        destinationLocationCode: destination.slice(0, 3).toUpperCase(),
        departureDate: startDate,
        returnDate: endDate,
        adults: 1
      })

      if (flights && flights.length > 0) {
        const bestFlight = flights[0]
        flightInfo = `<div class="flight-info p-4 bg-blue-50 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-blue-800 mb-3">Best Available Flight</h3>
          <p class="mb-2"><strong>Route:</strong> ${departure} to ${destination}</p>
          <p class="mb-2"><strong>Dates:</strong> ${startDate} - ${endDate}</p>
          ${bestFlight.price ? `<p class="mb-2"><strong>Price:</strong> ${bestFlight.price.total} ${bestFlight.price.currency}</p>` : ''}
          ${bestFlight.airline ? `<p class="mb-2"><strong>Airline:</strong> ${bestFlight.airline}</p>` : ''}
          ${bestFlight.duration ? `<p class="mb-2"><strong>Duration:</strong> ${bestFlight.duration}</p>` : ''}
          ${bestFlight.departure_time ? `<p class="mb-2"><strong>Departure:</strong> ${bestFlight.departure_time}</p>` : ''}
          ${bestFlight.arrival_time ? `<p class="mb-2"><strong>Arrival:</strong> ${bestFlight.arrival_time}</p>` : ''}
          <p class="text-sm text-blue-600 mt-4">* Please check airline websites for current prices and availability</p>
        </div>`
      } else {
        flightInfo = `<div class=\"p-4 bg-yellow-50 rounded-lg mb-6\">
          <p class=\"text-yellow-700\">No direct flights found for the specified route and dates. Consider checking nearby airports or alternative dates.</p>
        </div>`
      }
    } catch (error) {
      console.error("Error fetching flights:", error)
      flightInfo = `<div class=\"p-4 bg-yellow-50 rounded-lg mb-6\">
        <p class=\"text-yellow-700\">Unable to fetch real-time flight information. Please check airline websites directly for current flights and prices.</p>
      </div>`
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `I want to go from ${departure} to ${destination} between ${startDate} and ${endDate},
And while I'm there I'd love to ${activities}

Please provide a detailed itinerary that includes:
1. A day-by-day schedule with detailed activities and timing
2. Specific recommendations for the requested activities
3. Local transportation tips within the destination
4. Cultural considerations and local customs:
   - Important etiquette and behavior guidelines
   - Local traditions and customs to respect
   - Dress code recommendations
   - Dining customs and food etiquette
   - Common greetings and basic phrases
   - Cultural taboos to avoid

Format the response in clean, modern HTML with the following structure and styling:

<div class="trip-plan">
  <h1 class="text-4xl font-bold mb-8 text-green-600">Your Trip to ${destination}</h1>
  
  ${flightInfo}
  
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Day-by-Day Schedule</h2>
    [Provide the daily schedule here with proper HTML structure]
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Activity Recommendations</h2>
    [Provide specific activity recommendations]
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Local Transportation Tips</h2>
    [Provide local transportation information]
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Cultural Considerations</h2>
    [Provide detailed cultural insights and customs]
  </section>
</div>

Use appropriate HTML tags and Tailwind CSS classes for:
- Headings (h1, h2, h3)
- Paragraphs with proper spacing (p with mb-4)
- Lists (ul, ol with space-y-2)
- Important points (strong tags)
- Sections (div with mb-8)
- Prices and numbers (span with specific styling)
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error in planTrip:", error)
    return `<div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <p class="font-medium">Sorry, there was an error planning your trip:</p>
      <p class="mt-2">${error.message}</p>
    </div>`
  }
}

