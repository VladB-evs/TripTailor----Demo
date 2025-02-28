import Image from "next/image"
import { PlanTripForm } from "@/components/plan-trip-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex h-[50vh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-green-500/40 via-green-500/20 to-white">
        <div className="text-center px-4">
          <h1 className="hero-animate mb-6 text-4xl font-semibold tracking-tight text-black sm:text-5xl md:text-6xl">
            <span className="block">Your next adventure</span>
            <span className="hero-animate-delay-1 block bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">awaits.</span>
          </h1>
          <p className="hero-animate-delay-2 mb-8 text-base text-green-100 sm:text-lg md:text-xl">
            Let AI help you plan the perfect trip. Just tell us what you're looking for, and we'll create a
            personalized itinerary for you.
          </p>
        </div>
      </section>

      {/* Planning Section */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-medium">Plan Your Trip</h2>
          <p className="text-xl text-gray-600">Powered by Cohere AI for personalized recommendations</p>
        </div>
        <PlanTripForm />
      </section>
    </main>
  )
}

