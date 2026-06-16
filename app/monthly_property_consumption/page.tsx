"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Device = {
  id: number;
  name: string;
  category?: string;
  watts: number;
  hours: number;
  quantity: number;
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
  id: string;
  propertyName?: string;
  propertyType: string;
  country?: string;
  currency?: string;
  electricityRate?: number;
  numberOfFloors?: string;
  hasBasement?: boolean;
  hasRoof?: boolean;
  floors: Floor[];
};

export default function PropertyConsumptionPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingActive, setSettingActive] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  function loadProperties() {
    try {
      const savedProperties = JSON.parse(
        localStorage.getItem("properties") || "[]"
      );

      setProperties(savedProperties);
      setSelectedProperty(savedProperties[0] || null);
    } catch (error) {
      console.error(error);
      alert("Error loading properties.");
    } finally {
      setLoading(false);
    }
  }

  function deleteProperty(propertyId: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    const updatedProperties = properties.filter(
      (property) => property.id !== propertyId
    );

    localStorage.setItem("properties", JSON.stringify(updatedProperties));
    setProperties(updatedProperties);

    const activeProperty = JSON.parse(
      localStorage.getItem("activeProperty") || "null"
    );

    if (activeProperty?.id === propertyId) {
      localStorage.removeItem("activeProperty");
      localStorage.removeItem("activePropertyId");
      localStorage.removeItem("editPropertyId");
    }

    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(updatedProperties[0] || null);
    }

    alert("Property deleted successfully.");
  }

  function editProperty(property: PropertyData) {
    localStorage.setItem("activeProperty", JSON.stringify(property));
    localStorage.setItem("activePropertyId", property.id);
    localStorage.setItem("editPropertyId", property.id);
    router.push("/property_designer");
  }

  function setAsActiveProperty(property: PropertyData) {
    try {
      setSettingActive(true);
      localStorage.setItem("activeProperty", JSON.stringify(property));
      localStorage.setItem("activePropertyId", property.id);
      alert(`${property.propertyName || "Property"} is now active.`);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error setting active property.");
    } finally {
      setSettingActive(false);
    }
  }

  const property = selectedProperty;

  const totalRooms =
    property?.floors.reduce((sum, floor) => sum + floor.rooms.length, 0) || 0;

  const totalDevices =
    property?.floors.reduce(
      (floorSum, floor) =>
        floorSum +
        floor.rooms.reduce(
          (roomSum, room) => roomSum + (room.devices?.length || 0),
          0
        ),
      0
    ) || 0;

  const totalMonthlyKwh =
    property?.floors.reduce(
      (floorSum, floor) =>
        floorSum +
        floor.rooms.reduce(
          (roomSum, room) =>
            roomSum +
            (room.devices || []).reduce(
              (deviceSum, device) => deviceSum + device.monthlyKwh,
              0
            ),
          0
        ),
      0
    ) || 0;

  const currency = property?.currency || "KWD";
  const rate = property?.electricityRate || 0.002;

  const estimatedMonthlyCost = totalMonthlyKwh * rate;
  const estimatedAnnualCost = estimatedMonthlyCost * 12;

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-green-600 mb-3">
                ⚡ Monthly Property Consumption
              </h1>

              <p className="text-gray-600">
                View all saved properties and monitor their electricity
                consumption.
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("editPropertyId");
                localStorage.removeItem("activeProperty");
                localStorage.removeItem("activePropertyId");
                router.push("/property_designer");
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              Add New Property
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-8">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold mb-3">No Property Saved Yet</h2>

            <p className="text-gray-600 mb-6">
              You have not saved a property yet. Create your first property
              using the Property Designer.
            </p>

            <button
  onClick={() => router.push("/property_designer")}
  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
>
  Go to Property Designer
</button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Property Consumption Portfolio
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {properties.map((item) => {
                  const rooms = item.floors.reduce(
                    (sum, floor) => sum + floor.rooms.length,
                    0
                  );

                  const devices = item.floors.reduce(
                    (floorSum, floor) =>
                      floorSum +
                      floor.rooms.reduce(
                        (roomSum, room) =>
                          roomSum + (room.devices?.length || 0),
                        0
                      ),
                    0
                  );

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-2xl p-5 transition ${
                        selectedProperty?.id === item.id
                          ? "border-green-600 bg-green-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedProperty(item)}
                        className="w-full text-left"
                      >
                        <h3 className="text-xl font-bold text-green-700">
                          {item.propertyName || "Unnamed Property"}
                        </h3>

                        <p className="text-gray-600">{item.propertyType}</p>

                        <p className="text-sm text-gray-500 mt-2">
                          Floors: {item.floors.length} • Rooms: {rooms} •
                          Devices: {devices}
                        </p>
                      </button>

                      <div className="flex gap-4 mt-5">
                        <button
                          onClick={() => deleteProperty(item.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
                        >
                          Delete Property
                        </button>

                        <button
                          onClick={() => editProperty(item)}
                          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
                        >
                          Edit Property
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {property && (
              <>
                <div className="bg-white rounded-2xl shadow p-6 mb-8">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-green-600">
                        {property.propertyName || "Unnamed Property"}
                      </h2>

                      <p className="text-gray-600">
                        {property.propertyType} • {property.country || "Kuwait"}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          localStorage.setItem(
                            "activeProperty",
                            JSON.stringify(property)
                          );
                          localStorage.setItem("activePropertyId", property.id);
                          router.push("/recommendations");
                        }}
                        className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700"
                      >
                        Recommendations
                      </button>

                      <button
                        onClick={() => setAsActiveProperty(property)}
                        disabled={settingActive}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {settingActive ? "Opening..." : "Open in Dashboard"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">Property Type</p>
                    <h2 className="text-2xl font-bold text-green-600">
                      {property.propertyType}
                    </h2>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">Floors</p>
                    <h2 className="text-2xl font-bold">
                      {property.floors.length}
                    </h2>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">Rooms</p>
                    <h2 className="text-2xl font-bold">{totalRooms}</h2>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">Devices</p>
                    <h2 className="text-2xl font-bold">{totalDevices}</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">Monthly Consumption</p>
                    <h2 className="text-2xl font-bold text-blue-600">
                      {totalMonthlyKwh.toFixed(2)} kWh
                    </h2>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">
                      Estimated Monthly Cost
                    </p>
                    <h2 className="text-2xl font-bold text-green-600">
                      {estimatedMonthlyCost.toFixed(3)} {currency}
                    </h2>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-gray-500 mb-2">Estimated Annual Cost</p>
                    <h2 className="text-2xl font-bold text-red-600">
                      {estimatedAnnualCost.toFixed(3)} {currency}
                    </h2>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-8">
                  <h2 className="text-3xl font-bold mb-6">
                    Property Layout Summary
                  </h2>

                  <div className="space-y-6">
                    {property.floors.map((floor) => (
                      <div
                        key={floor.id}
                        className="border rounded-2xl p-6 bg-gray-50"
                      >
                        <h3 className="text-2xl font-bold text-green-600 mb-4">
                          {floor.name}
                        </h3>

                        {floor.rooms.length === 0 ? (
                          <p className="text-gray-500">No rooms added.</p>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {floor.rooms.map((room) => (
                              <div
                                key={room.id}
                                className="bg-white border rounded-xl p-4"
                              >
                                <h4 className="text-lg font-bold mb-2">
                                  {room.name}
                                </h4>

                                {(room.devices || []).length === 0 ? (
                                  <p className="text-gray-500 text-sm">
                                    No devices added.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {(room.devices || []).map((device) => (
                                      <div
                                        key={device.id}
                                        className="bg-gray-100 rounded-lg p-3 text-sm"
                                      >
                                        <p className="font-bold">
                                          {device.name}
                                        </p>

                                        <p>
                                          {device.watts}W × {device.hours}
                                          h/day × {device.quantity}
                                        </p>

                                        <p className="text-blue-600 font-semibold">
                                          {device.monthlyKwh.toFixed(2)}{" "}
                                          kWh/month
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}