import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow">
            W
          </div>

          <span className="text-3xl font-bold text-green-600">
            WattSave AI
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 font-semibold text-gray-800">

          <Link
            href="/"
            className="hover:text-green-600 transition"
          >
            Home
          </Link>

          <Link
            href="/property_designer"
            className="hover:text-green-600 transition"
          >
            Property Designer
          </Link>

          <Link
            href="/fill_in_daily_property_consumption"
            className="hover:text-green-600 transition"
          >
            Fill in Daily Property Consumption
          </Link>

          <Link
            href="/monthly_property_consumption"
            className="hover:text-green-600 transition"
          >
            Monthly Property Consumption
          </Link>

          <Link
            href="/dashboard"
            className="hover:text-green-600 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/recommendations"
            className="hover:text-green-600 transition"
          >
            Recommendations
          </Link>

          <LogoutButton />

        </div>
      </div>
    </nav>
  );
}