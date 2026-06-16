import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="bg-white rounded-3xl shadow p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">⚡</span>

            <h1 className="text-5xl font-bold text-green-600">
              WattSave AI
            </h1>
          </div>

          <p className="text-2xl text-gray-700 max-w-5xl mx-auto leading-10 mb-12">
            WattSave AI helps homeowners and businesses understand, monitor,
            and reduce electricity consumption. Design your property, add rooms
            and devices, fill in daily property consumption, track monthly
            energy usage and electricity costs through intelligent analytics,
            dashboards, and personalized recommendations.
          </p>

          <div className="flex justify-center gap-5 mb-14">
            <Link
              href="/property_designer"
              className="bg-green-600 text-white px-10 py-4 rounded-2xl text-xl font-semibold hover:bg-green-700 transition"
            >
              Start Property Designer
            </Link>

            <a
              href="#contact"
              className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-xl font-semibold hover:bg-black transition"
            >
              Contact Us
            </a>
          </div>

          <div className="bg-gray-50 rounded-3xl p-10">
            <h2 className="text-5xl font-bold text-gray-900 mb-10">
              How WattSave Works
            </h2>

            <div className="flex flex-wrap justify-center items-stretch gap-4">
              <div className="bg-white border rounded-2xl p-6 shadow w-60">
                <h3 className="font-bold text-green-600 text-xl mb-3">
                  1. Property Designer
                </h3>
                <p className="text-gray-600">
                  Create your property layout, floors, rooms, and devices.
                </p>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow w-60">
                <h3 className="font-bold text-blue-600 text-xl mb-3">
                  2. Fill in Daily Property Consumption
                </h3>
                <p className="text-gray-600">
                  Enter daily operating hours for each device, room by room and
                  floor by floor.
                </p>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow w-60">
                <h3 className="font-bold text-orange-600 text-xl mb-3">
                  3. Monthly Property Consumption
                </h3>
                <p className="text-gray-600">
                  Track accumulated monthly energy usage and electricity costs.
                </p>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow w-60">
                <h3 className="font-bold text-purple-600 text-xl mb-3">
                  4. Dashboard
                </h3>
                <p className="text-gray-600">
                  Upload bills, view charts, trends, forecasts, and energy
                  insights.
                </p>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow w-60">
                <h3 className="font-bold text-red-600 text-xl mb-3">
                  5. Recommendations
                </h3>
                <p className="text-gray-600">
                  Receive personalized recommendations to reduce energy
                  consumption and save money.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-7xl mx-auto px-8 pb-16">
        <div className="bg-white rounded-3xl shadow p-10 text-center">
          <h2 className="text-4xl font-bold text-green-600 mb-4">
            Contact Us
          </h2>

          <p className="text-xl text-gray-700 mb-6">
            Questions, feedback, business partnerships, or feature requests?
          </p>

          <a
            href="mailto:energywattsaver@gmail.com"
            className="text-3xl font-extrabold text-green-600 hover:text-green-700 transition"
          >
            energywattsaver@gmail.com
          </a>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-6 text-center">
        <p className="text-lg font-semibold">
          WattSave AI Beta • Free During Testing
        </p>

        <p className="text-sm text-gray-300 mt-2">
          All features are currently free during beta testing.
        </p>
      </footer>
    </main>
  );
}