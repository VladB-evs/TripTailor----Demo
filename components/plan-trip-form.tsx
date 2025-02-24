"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { planTrip } from "@/app/actions"
import { searchFlights, searchHotels } from "@/app/api/travel-api"

export function PlanTripForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [flightOffers, setFlightOffers] = useState([])
  const [hotelOffers, setHotelOffers] = useState([])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const departure = formData.get("departure") as string
    const destination = formData.get("destination") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const activities = formData.get("activities") as string

    try {
      // Get trip itinerary from Gemini
      const itinerary = await planTrip({ departure, destination, startDate, endDate, activities })
      setResult(itinerary)

      // Search for flights using Amadeus API
      const flights = await searchFlights({
        originLocationCode: departure.slice(0, 3).toUpperCase(), // Assuming city codes are first 3 letters
        destinationLocationCode: destination.slice(0, 3).toUpperCase(),
        departureDate: startDate,
        returnDate: endDate
      })
      setFlightOffers(flights)

      // Search for hotels using Amadeus API
      const hotels = await searchHotels({
        cityCode: destination.slice(0, 3).toUpperCase(),
        checkInDate: startDate,
        checkOutDate: endDate
      })
      setHotelOffers(hotels)

    } catch (error: any) {
      console.error(error)
      setError(error.message || "An error occurred while planning your trip. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="text-[32px] leading-relaxed font-light">
            <p className="flex flex-wrap items-center justify-center gap-2 pb-4">
              I want to go from
              <input
                name="departure"
                placeholder="Departure city"
                className="mx-2 px-4 py-1 w-[200px] inline-block border-b-2 border-gray-200 focus:border-primary bg-transparent outline-none transition-all"
                required
              />
              to
              <input
                name="destination"
                placeholder="Destination"
                className="mx-2 px-4 py-1 w-[200px] inline-block border-b-2 border-gray-200 focus:border-primary bg-transparent outline-none transition-all"
                required
              />
              between
              <input
                type="date"
                name="startDate"
                className="mx-2 px-4 py-1 w-[200px] inline-block border-b-2 border-gray-200 focus:border-primary bg-transparent outline-none transition-all"
                required
              />
              and
              <input
                type="date"
                name="endDate"
                className="mx-2 px-4 py-1 w-[200px] inline-block border-b-2 border-gray-200 focus:border-primary bg-transparent outline-none transition-all"
                required
              />
            </p>
            <p className="flex flex-wrap items-center justify-center gap-2">
              And while I'm there I'd love to
              <input
                name="activities"
                placeholder="Activities"
                className="mx-2 px-4 py-1 w-[300px] inline-block border-b-2 border-gray-200 focus:border-primary bg-transparent outline-none transition-all"
                required
              />
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full max-w-sm mx-auto text-lg font-medium bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all" 
            size="lg" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Planning your trip...
              </>
            ) : (
              "Plan my trip"
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-8 mt-8">
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardContent className="prose mt-6">
                <div dangerouslySetInnerHTML={{ __html: result }} />
              </CardContent>
            </Card>

            {flightOffers.length > 0 && (
              <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
                <CardContent className="prose mt-6">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Available Flights</h2>
                  <div className="space-y-4">
                    {flightOffers.map((flight: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="font-medium">Flight {index + 1}</p>
                        <p>Price: {flight.price?.total} {flight.price?.currency}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {hotelOffers.length > 0 && (
              <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
                <CardContent className="prose mt-6">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Available Hotels</h2>
                  <div className="space-y-4">
                    {hotelOffers.map((hotel: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="font-medium">{hotel.hotel?.name}</p>
                        <p>Price: {hotel.offers?.[0]?.price?.total} {hotel.offers?.[0]?.price?.currency}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

