import React from 'react';

const Features = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-3">
            {/* Smart Flight Search Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-900 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900 mb-2">Smart Flight Search</h3>
              <p className="text-base leading-7 text-gray-600">Find the perfect flights with our intelligent search algorithm that considers your preferences and budget.</p>
            </div>

            {/* AI Travel Planning Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-900 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900 mb-2">AI Travel Planning</h3>
              <p className="text-base leading-7 text-gray-600">Let our AI create personalized itineraries based on your interests and travel style.</p>
            </div>

            {/* Global Coverage Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-900 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-base leading-7 text-gray-600">Access flights and destinations worldwide with our comprehensive travel network.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;