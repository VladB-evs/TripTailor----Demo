"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Loader2, Plane, Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { planTrip } from "@/app/actions"
import { searchFlights, searchHotels } from "@/app/api/travel-api"

export function PlanTripForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [flightOffers, setFlightOffers] = useState([])
  const [hotelOffers, setHotelOffers] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    itinerary: true,
    flights: true,
    hotels: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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
      // Get trip itinerary from Cohere
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
    <div className="min-h-[40vh] flex items-center justify-center py-8">
      <div className="w-full max-w-5xl mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
        {/* Form Section with improved styling */}
        <form onSubmit={onSubmit} className="space-y-10 mb-10">
          <div className="text-2xl md:text-3xl leading-relaxed font-light max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
              <span className="whitespace-nowrap">I want to go from</span>
              <input
                name="departure"
                placeholder="Departure city"
                className="px-4 py-2 w-full md:w-[200px] border-b-2 border-gray-200 focus:border-green-500 bg-transparent outline-none transition-all rounded-md"
                required
              />
              <span className="whitespace-nowrap">to</span>
              <input
                name="destination"
                placeholder="Destination"
                className="px-4 py-2 w-full md:w-[200px] border-b-2 border-gray-200 focus:border-green-500 bg-transparent outline-none transition-all rounded-md"
                required
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
              <span className="whitespace-nowrap">between</span>
              <input
                type="date"
                name="startDate"
                className="px-4 py-2 w-full md:w-[200px] border-b-2 border-gray-200 focus:border-green-500 bg-transparent outline-none transition-all rounded-md"
                required
              />
              <span className="whitespace-nowrap">and</span>
              <input
                type="date"
                name="endDate"
                className="px-4 py-2 w-full md:w-[200px] border-b-2 border-gray-200 focus:border-green-500 bg-transparent outline-none transition-all rounded-md"
                required
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <span className="whitespace-nowrap">And while I'm there I'd love to</span>
              <input
                name="activities"
                placeholder="Activities"
                className="px-4 py-2 w-full md:w-[300px] border-b-2 border-gray-200 focus:border-green-500 bg-transparent outline-none transition-all rounded-md"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full max-w-sm mx-auto text-lg font-medium bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all py-6" 
            size="lg" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Planning your trip...
              </>
            ) : (
              "Plan my trip"
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-8 p-6 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Results Section with collapsible cards */}
        {result && (
          <div className="space-y-6 mt-8">
            {/* Itinerary Card */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg overflow-hidden">
              <CardHeader className="bg-green-50 border-b border-green-100 cursor-pointer" onClick={() => toggleSection('itinerary')}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-semibold text-green-800">Your Trip Itinerary</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {expandedSections.itinerary ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.itinerary && (
                <CardContent className="prose max-w-none p-6 overflow-auto max-h-[70vh]">
                  <div dangerouslySetInnerHTML={{ __html: result }} />
                </CardContent>
              )}
            </Card>

            {/* Flights Card */}
            {flightOffers.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm shadow-lg overflow-hidden">
                <CardHeader className="bg-blue-50 border-b border-blue-100 cursor-pointer" onClick={() => toggleSection('flights')}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Plane className="h-5 w-5 mr-2 text-blue-600" />
                      <CardTitle className="text-2xl font-semibold text-blue-800">Available Flights</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {expandedSections.flights ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </CardHeader>
                {expandedSections.flights && (
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {flightOffers.map((flight: any, index: number) => (
                        <div key={index} className="p-4 border border-blue-100 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors">
                          <p className="font-medium text-blue-800 mb-2">Flight {index + 1}</p>
                          <p className="text-blue-700">
                            <span className="font-semibold">Price:</span> 
                            <span className="ml-2 text-lg">{flight.price?.total} {flight.price?.currency}</span>
                          </p>
                          {flight.airline && <p className="text-blue-700"><span className="font-semibold">Airline:</span> {flight.airline}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Hotels Card */}
            {hotelOffers.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm shadow-lg overflow-hidden">
                <CardHeader className="bg-amber-50 border-b border-amber-100 cursor-pointer" onClick={() => toggleSection('hotels')}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Hotel className="h-5 w-5 mr-2 text-amber-600" />
                      <CardTitle className="text-2xl font-semibold text-amber-800">Available Hotels</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {expandedSections.hotels ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </CardHeader>
                {expandedSections.hotels && (
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hotelOffers.map((hotel: any, index: number) => (
                        <div key={index} className="p-4 border border-amber-100 rounded-lg bg-amber-50/50 hover:bg-amber-50 transition-colors">
                          <p className="font-medium text-amber-800 mb-2">{hotel.hotel?.name || `Hotel ${index + 1}`}</p>
                          <p className="text-amber-700">
                            <span className="font-semibold">Price:</span> 
                            <span className="ml-2 text-lg">{hotel.offers?.[0]?.price?.total} {hotel.offers?.[0]?.price?.currency}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

