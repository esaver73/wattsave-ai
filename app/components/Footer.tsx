import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16 px-8 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">

        <div>
          <h2 className="text-2xl font-bold text-green-600">
            WattSave AI
          </h2>

          <p className="text-gray-600 mt-2">
            Smart Energy Management Platform
          </p>
        </div>

        <div className="flex gap-6 font-semibold">

        </div>

      </div>

      <p className="text-center text-gray-500 mt-8">
        © 2026 WattSave AI. All rights reserved.
      </p>
    </footer>
  );
}