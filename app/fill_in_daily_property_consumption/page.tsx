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
  currency?: string;
  electricityRate?: number;
  floors: Floor[];
};

type UsageRecord = {
  id: string;
  date: string;
  propertyId: string;
  propertyName: string;
  deviceName: string;
  roomName: string;
  floorName: string;
  hoursUsed: number;
  kWh: number;
  cost: number;
};

export default function DailyUsagePage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [proceeded, setProceeded] = useState(false);
  const [hoursUsed, setHoursUsed] = useState<Record<string, string>>({});
  const [dailyRecords, setDailyRecords] = useState<UsageRecord[]>([]);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  function loadProperties() {
    const savedProperties = JSON.parse(
      localStorage.getItem("properties") || "[]"
    );

    setProperties(savedProperties);

    if (savedProperties.length > 0) {
      setSelectedPropertyId(savedProperties[0].id);
    }
  }

  const selectedProperty = properties.find(
    (property) => property.id === selectedPropertyId
  );

  const currency = selectedProperty?.currency || "KWD";
  const rate = selectedProperty?.electricityRate || 0.002;

  function getDatesBetween(start: string, end: string) {
    const dates: string[] = [];
    const current = new Date(start);
    const final = new Date(end);

    while (current <= final) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  const selectedDates = getDatesBetween(startDate, endDate);
  const numberOfDays = selectedDates.length;

  function getAllDevices() {
    if (!selectedProperty) return [];

    return selectedProperty.floors.flatMap((floor) =>
      floor.rooms.flatMap((room) =>
        (room.devices || []).map((device) => ({
          ...device,
          floorName: floor.name,
          roomName: room.name,
          key: `${floor.id}-${room.id}-${device.id}`,
        }))
      )
    );
  }

  const allDevices = getAllDevices();

  const totalConsumptionKwh = dailyRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const totalConsumptionCost = dailyRecords.reduce(
    (sum, record) => sum + record.cost,
    0
  );

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

    if (selectedPropertyId === propertyId) {
      setSelectedPropertyId(updatedProperties[0]?.id || "");
    }

    alert("Property deleted successfully.");
  }

  function editProperty(property: PropertyData) {
    localStorage.setItem("activeProperty", JSON.stringify(property));
    localStorage.setItem("activePropertyId", property.id);
    localStorage.setItem("editPropertyId", property.id);
    router.push("/property_designer");
  }

  function proceed() {
    if (!selectedProperty) {
      alert("Please select a property.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date must be after start date.");
      return;
    }

    if (allDevices.length === 0) {
      alert("This property has no devices.");
      return;
    }

    setProceeded(true);
    setCalculated(false);
    setDailyRecords([]);
  }

  function buildConsumptionRecords() {
    if (!selectedProperty) return [];

    const newRecords: UsageRecord[] = [];

    selectedDates.forEach((date) => {
      allDevices.forEach((device) => {
        const key = `${date}-${device.key}`;
        const hours = Number(hoursUsed[key] || 0);

        if (hours > 0) {
          const kWh = (device.watts / 1000) * hours * device.quantity;
          const cost = kWh * rate;

          newRecords.push({
            id: `${date}-${device.id}`,
            date,
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.propertyName || "Unnamed Property",
            deviceName: device.name,
            roomName: device.roomName,
            floorName: device.floorName,
            hoursUsed: hours,
            kWh,
            cost,
          });
        }
      });
    });

    return newRecords;
  }

  function calculateConsumption() {
    const records = buildConsumptionRecords();

    if (records.length === 0) {
      alert("Please enter hours for at least one device.");
      return;
    }

    setDailyRecords(records);
    setCalculated(true);
  }

  function saveDailyConsumption() {
    if (!selectedProperty) return;

    const recordsToSave =
      dailyRecords.length > 0 ? dailyRecords : buildConsumptionRecords();

    if (recordsToSave.length === 0) {
      alert("Please enter hours first.");
      return;
    }

    const oldRecords: UsageRecord[] = JSON.parse(
      localStorage.getItem("dailyUsage") || "[]"
    );

    const cleanedOldRecords = oldRecords.filter(
      (record) =>
        !(
          record.propertyId === selectedProperty.id &&
          new Date(record.date) >= new Date(startDate) &&
          new Date(record.date) <= new Date(endDate)
        )
    );

    localStorage.setItem(
      "dailyUsage",
      JSON.stringify([...recordsToSave, ...cleanedOldRecords])
    );

    setDailyRecords(recordsToSave);
    setCalculated(true);

    alert("Daily property consumption saved successfully.");
  }

  function goToDashboard() {
    if (selectedProperty) {
      localStorage.setItem("activeProperty", JSON.stringify(selectedProperty));
      localStorage.setItem("activePropertyId", selectedProperty.id);
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-3">
            ⚡ Fill in Daily Property Consumption
          </h1>

          <p className="text-gray-600">
            Select property, start date, and end date, then enter device
            operating hours day by day.
          </p>
        </div>

        {properties.length === 0 ? (
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
           <h2 className="text-3xl font-bold text-gray-900 mb-6">
  Property Consumption Portfolio
</h2>

              <div className="grid md:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`border rounded-2xl p-5 ${
                      selectedPropertyId === property.id
                        ? "border-green-600 bg-green-50"
                        : "bg-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        setProceeded(false);
                        setCalculated(false);
                        setDailyRecords([]);
                      }}
                      className="w-full text-left"
                    >
                      <h3 className="text-xl font-bold text-green-700">
                        {property.propertyName || "Unnamed Property"}
                      </h3>

                      <p className="text-gray-600">{property.propertyType}</p>
                    </button>

                    <div className="flex gap-4 mt-5">
                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => editProperty(property)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h2 className="text-3xl font-bold text-green-600 mb-6">
                Property Consumption Duration
              </h2>

              <div className="grid md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block font-semibold mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setProceeded(false);
                      setCalculated(false);
                      setDailyRecords([]);
                    }}
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">End Date</label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setProceeded(false);
                      setCalculated(false);
                      setDailyRecords([]);
                    }}
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Number of Days
                  </label>

                  <div className="w-full border p-3 rounded-xl bg-gray-50 font-bold">
                    {numberOfDays} days
                  </div>
                </div>

                <button
                  onClick={proceed}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                >
                  Proceed
                </button>
              </div>
            </div>

            {proceeded && (
              <div className="bg-white rounded-2xl shadow p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  Daily Property Consumption
                </h2>

                <div className="space-y-6">
                  {selectedDates.map((date) => (
                    <div
                      key={date}
                      className="border rounded-2xl p-5 bg-gray-50"
                    >
                      <h3 className="text-xl font-bold text-green-600 mb-4">
                        {date}
                      </h3>

                      <div className="space-y-3">
                        {allDevices.map((device) => {
                          const key = `${date}-${device.key}`;

                          return (
                            <div
                              key={key}
                              className="grid md:grid-cols-5 gap-4 items-center bg-white border rounded-xl p-4"
                            >
                              <div className="md:col-span-2">
                                <p className="font-bold">{device.name}</p>
                                <p className="text-sm text-gray-500">
                                  {device.floorName} • {device.roomName}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500">Power</p>
                                <p className="font-semibold">
                                  {device.watts} W
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500">
                                  Quantity
                                </p>
                                <p className="font-semibold">
                                  {device.quantity}
                                </p>
                              </div>

                              <input
                                type="number"
                                min="0"
                                max="24"
                                placeholder="Hours"
                                value={hoursUsed[key] || ""}
                                onChange={(e) =>
                                  setHoursUsed({
                                    ...hoursUsed,
                                    [key]: e.target.value,
                                  })
                                }
                                className="border p-3 rounded-xl"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={calculateConsumption}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
                  >
                    Calculate Consumption
                  </button>

                  <button
                    onClick={saveDailyConsumption}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                  >
                    Save Daily Consumption
                  </button>

                  <button
                    onClick={goToDashboard}
                    className="bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900"
                  >
                    Go to Dashboard
                  </button>
                </div>

                {calculated && (
                  <div className="mt-6 bg-blue-50 border rounded-xl p-5">
                    <h3 className="text-xl font-bold mb-3">
                      Consumption Result
                    </h3>

                    <p>
                      Period:{" "}
                      <strong>
                        {startDate} to {endDate}
                      </strong>
                    </p>

                    <p>
                      Total consumption:{" "}
                      <strong>
                        {totalConsumptionKwh.toFixed(2)} kWh
                      </strong>
                    </p>

                    <p>
                      Total cost:{" "}
                      <strong>
                        {totalConsumptionCost.toFixed(3)} {currency}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}