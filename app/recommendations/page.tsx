"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Device = {
  id: number;
  name: string;
  category?: string;
  watts?: number;
  hours?: number;
  quantity?: number;
  monthlyKwh: number;
};

type Room = {
  id: number;
  name: string;
  devices?: Device[];
};

type Floor = {
  id: number;
  name: string;
  rooms: Room[];
};

type PropertyData = {
  id?: string;
  propertyName?: string;
  propertyType: string;
  currency?: string;
  electricityRate?: number;
  floors: Floor[];
};

export default function RecommendationsPage() {
  const router = useRouter();

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
  setCheckingLogin(false);
}, []);

  useEffect(() => {
    const saved = localStorage.getItem("activeProperty");

    if (saved) {
      setProperty(JSON.parse(saved));
    }
  }, []);

  if (checkingLogin) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 pt-28">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
          Checking login...
        </div>
      </main>
    );
  }

  const currency = property?.currency || "KWD";
  const rate = property?.electricityRate || 0.002;

  const allDevices =
    property?.floors.flatMap((floor) =>
      floor.rooms.flatMap((room) =>
        (room.devices || []).map((device) => ({
          ...device,
          roomName: room.name,
          floorName: floor.name,
          category: device.category || "Other",
        }))
      )
    ) || [];

  const totalMonthlyKwh = allDevices.reduce(
    (sum, device) => sum + (device.monthlyKwh || 0),
    0
  );

  const totalMonthlyCost = totalMonthlyKwh * rate;

  const highestDevice =
    allDevices.length > 0
      ? allDevices.reduce((max, device) =>
          device.monthlyKwh > max.monthlyKwh ? device : max
        )
      : null;

  const categoryTotals = allDevices.reduce((acc, device) => {
    const category = device.category || "Other";
    acc[category] = (acc[category] || 0) + (device.monthlyKwh || 0);
    return acc;
  }, {} as Record<string, number>);

  const highestCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || null;

  const estimatedSavingKwh = totalMonthlyKwh * 0.15;
  const estimatedSavingCost = estimatedSavingKwh * rate;

  const recommendations = [
    {
      title: highestDevice
        ? `Optimize ${highestDevice.name}`
        : "Optimize high-consumption devices",
      saving: "10-20%",
      description: highestDevice
        ? `${highestDevice.name} is your highest energy consumer at ${highestDevice.monthlyKwh.toFixed(
            2
          )} kWh/month. Reduce unnecessary operating hours, check maintenance, and use efficient settings.`
        : "Add devices to your property to generate personalized recommendations.",
    },
    {
      title: highestCategory
        ? `Reduce ${highestCategory[0]} consumption`
        : "Reduce category consumption",
      saving: "10-15%",
      description: highestCategory
        ? `${highestCategory[0]} is the highest consumption category at ${highestCategory[1].toFixed(
            2
          )} kWh/month. Focus first on this category to get the biggest saving impact.`
        : "Once devices are added, WattSave will identify your highest consumption category.",
    },
    {
      title: "Improve daily operating habits",
      saving: "5-10%",
      description:
        "Use Fill in Daily Property Consumption to track actual hours used each day. This helps compare expected consumption with real usage.",
    },
    {
      title: "Compare your electricity bill",
      saving: "Varies",
      description:
        "Upload your electricity bill in the Dashboard and compare actual consumption with WattSave estimates to find hidden waste.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-28">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-3">
            Energy Recommendations
          </h1>

          <p className="text-gray-600">
            Personalized recommendations based on your selected property and
            energy consumption data.
          </p>
        </div>

        {!property ? (
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold mb-3">No Active Property</h2>
            <p className="text-gray-600">
              Please select a property from Monthly Property Consumption first.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500 mb-2">Property</p>
                <h2 className="text-xl font-bold text-green-600">
                  {property.propertyName || "Unnamed Property"}
                </h2>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500 mb-2">Monthly Consumption</p>
                <h2 className="text-xl font-bold text-blue-600">
                  {totalMonthlyKwh.toFixed(2)} kWh
                </h2>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500 mb-2">Monthly Cost</p>
                <h2 className="text-xl font-bold text-green-600">
                  {totalMonthlyCost.toFixed(3)} {currency}
                </h2>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-gray-500 mb-2">Potential Saving</p>
                <h2 className="text-xl font-bold text-red-600">
                  {estimatedSavingCost.toFixed(3)} {currency}/month
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Property Energy Insight
              </h2>

              <p className="text-gray-700">
                Highest device:{" "}
                <strong>
                  {highestDevice ? highestDevice.name : "No device data"}
                </strong>
              </p>

              <p className="text-gray-700">
                Highest category:{" "}
                <strong>
                  {highestCategory ? highestCategory[0] : "No category data"}
                </strong>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-2xl font-bold text-green-600 mb-2">
                    {item.title}
                  </h2>

                  <p className="text-orange-600 font-semibold mb-3">
                    Potential Saving: {item.saving}
                  </p>

                  <p className="text-gray-600 mb-4">{item.description}</p>

                  <button
                    onClick={() =>
                      alert("Provider list will be added in Phase 2.")
                    }
                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                  >
                    Recommended Providers
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}