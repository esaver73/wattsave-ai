"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ConsumptionMode = "monthly" | "daily";
type RoomMethod = "manual" | "photo";

type Device = {
  id: number;
  name: string;
  category: string;
  watts: number;
  hours: number;
  quantity: number;
  monthlyKwh: number;
};

type Room = {
  id: number;
  name: string;
  devices: Device[];
};

type Floor = {
  id: number;
  name: string;
  rooms: Room[];
};

type DeviceFormState = {
  selectedPreset: string;
  deviceName: string;
  deviceCategory: string;
  deviceWatts: string;
  deviceHours: string;
  deviceQuantity: string;
};

const emptyDeviceForm: DeviceFormState = {
  selectedPreset: "",
  deviceName: "",
  deviceCategory: "",
  deviceWatts: "",
  deviceHours: "",
  deviceQuantity: "1",
};

const deviceDefaults: Record<string, number> = {
  "Air Conditioner (Split)": 1800,
  "Air Conditioner (Window)": 1500,
  "Air Conditioner (Central)": 3500,
  Refrigerator: 200,
  Freezer: 300,
  "Water Cooler": 120,
  Microwave: 1200,
  "Electric Oven": 2500,
  "Electric Stove": 2000,
  "Cooking Machine": 1500,
  "Air Fryer": 1500,
  "Coffee Machine": 1000,
  Kettle: 2000,
  Toaster: 800,
  "Washing Machine": 500,
  "Clothes Dryer": 3000,
  Iron: 1200,
  TV: 120,
  Computer: 300,
  Laptop: 65,
  Printer: 100,
  Router: 15,
  "Phone Charger": 20,
  "Charging Plug": 20,
  "USB Charger": 15,
  "LED Light": 10,
  "Tube Light": 40,
  "Spot Light": 15,
  Chandelier: 300,
  "Water Pump": 750,
  "Booster Pump": 1100,
  "Swimming Pool Pump": 1500,
  "Ceiling Fan": 75,
  "Exhaust Fan": 60,
  "Water Heater": 3000,
  "Electric Heater": 2000,
  "Vacuum Cleaner": 1200,
};

const deviceTypes = [...Object.keys(deviceDefaults), "Other - Manual Entry"];

export default function PropertyEnergyBuilderPage() {
  const router = useRouter();

  const [propertyName, setPropertyName] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [electricityRate, setElectricityRate] = useState("");
  const [consumptionMode, setConsumptionMode] =
    useState<ConsumptionMode>("monthly");

  const [propertyType, setPropertyType] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("1");
  const [hasBasement, setHasBasement] = useState(false);
  const [hasRoof, setHasRoof] = useState(false);

  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [roomName, setRoomName] = useState("");

  const [roomMethods, setRoomMethods] = useState<Record<number, RoomMethod>>({});
  const [deviceForms, setDeviceForms] = useState<
    Record<number, DeviceFormState>
  >({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const editPropertyId = localStorage.getItem("editPropertyId");
    const activeProperty = localStorage.getItem("activeProperty");

    if (!editPropertyId || !activeProperty) return;

    const property = JSON.parse(activeProperty);

    setPropertyName(property.propertyName || "");
    setCountry(property.country || "");
    setCurrency(property.currency || "");
    setElectricityRate(property.electricityRate?.toString() || "");
    setPropertyType(property.propertyType || "");
    setConsumptionMode(property.consumptionMode || "monthly");
    setNumberOfFloors(property.numberOfFloors?.toString() || "1");
    setHasBasement(property.hasBasement || false);
    setHasRoof(property.hasRoof || false);
    setFloors(property.floors || []);

    if (property.floors?.length > 0) {
      setSelectedFloorId(property.floors[0].id);
    }
  }, []);

  const step1Completed =
    propertyName.trim() !== "" &&
    country !== "" &&
    currency !== "" &&
    electricityRate !== "";

  const step2Completed = step1Completed && propertyType !== "";
  const step3Completed = step2Completed && floors.length > 0;

  function getDeviceForm(roomId: number) {
    return deviceForms[roomId] || emptyDeviceForm;
  }

  function updateDeviceForm(roomId: number, updates: Partial<DeviceFormState>) {
    setDeviceForms((current) => ({
      ...current,
      [roomId]: {
        ...(current[roomId] || emptyDeviceForm),
        ...updates,
      },
    }));
  }

  function resetDeviceForm(roomId: number) {
    setDeviceForms((current) => ({
      ...current,
      [roomId]: { ...emptyDeviceForm },
    }));
  }

  function setRoomMethodForRoom(roomId: number, method: RoomMethod) {
    setRoomMethods((current) => ({
      ...current,
      [roomId]: method,
    }));
  }

  function clearRoomMethod(roomId: number) {
    setRoomMethods((current) => {
      const updated = { ...current };
      delete updated[roomId];
      return updated;
    });
  }

  function getFloorName(index: number) {
    if (index === 0) return "Ground Floor";
    if (index === 1) return "First Floor";
    if (index === 2) return "Second Floor";
    if (index === 3) return "Third Floor";
    return `${index}th Floor`;
  }

  function selectPropertyType(type: string) {
    setPropertyType(type);
    setFloors([]);
    setSelectedFloorId(null);
  }

  function generateFloors() {
    if (!step2Completed) {
      alert("Please complete Step 1 and Step 2 first.");
      return;
    }

    const count = Number(numberOfFloors);

    if (!count || count < 1) {
      alert("Please enter a valid number of floors.");
      return;
    }

    const generatedFloors: Floor[] = [];
    let id = Date.now();

    if (hasBasement) {
      generatedFloors.push({
        id: id++,
        name: "Basement",
        rooms: [],
      });
    }

    for (let i = 0; i < count; i++) {
      generatedFloors.push({
        id: id++,
        name:
          propertyType === "Workshop" && count === 1 && i === 0
            ? "Workshop Area"
            : getFloorName(i),
        rooms: [],
      });
    }

    if (hasRoof) {
      generatedFloors.push({
        id: id++,
        name: "Roof",
        rooms: [],
      });
    }

    setFloors(generatedFloors);
    setSelectedFloorId(generatedFloors[0]?.id ?? null);
  }

  function addRoom() {
    if (!step3Completed) {
      alert("Please generate floors first.");
      return;
    }

    if (!roomName.trim() || selectedFloorId === null) {
      alert("Please select a floor and enter room name.");
      return;
    }

    const newRoom: Room = {
      id: Date.now() + Math.floor(Math.random() * 100000),
      name: roomName.trim(),
      devices: [],
    };

    setFloors((currentFloors) =>
      currentFloors.map((floor) =>
        floor.id === selectedFloorId
          ? {
              ...floor,
              rooms: [...floor.rooms, newRoom],
            }
          : floor
      )
    );

    setRoomName("");
  }

  function deleteFloor(floorId: number) {
    setFloors((currentFloors) =>
      currentFloors.filter((floor) => floor.id !== floorId)
    );
  }

  function deleteRoom(floorId: number, roomId: number) {
    setFloors((currentFloors) =>
      currentFloors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.filter((room) => room.id !== roomId),
            }
          : floor
      )
    );
  }

  function addDeviceToRoom(floorId: number, roomId: number, newDevice: Device) {
    setFloors((currentFloors) =>
      currentFloors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.map((room) =>
                room.id === roomId
                  ? {
                      ...room,
                      devices: [...room.devices, newDevice],
                    }
                  : room
              ),
            }
          : floor
      )
    );
  }

  function deleteDevice(floorId: number, roomId: number, deviceId: number) {
    setFloors((currentFloors) =>
      currentFloors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.map((room) =>
                room.id === roomId
                  ? {
                      ...room,
                      devices: room.devices.filter(
                        (device) => device.id !== deviceId
                      ),
                    }
                  : room
              ),
            }
          : floor
      )
    );
  }

  function handleDeviceTypeChange(roomId: number, selected: string) {
    if (selected === "Other - Manual Entry") {
      updateDeviceForm(roomId, {
        selectedPreset: selected,
        deviceName: "",
        deviceCategory: "Other",
        deviceWatts: "",
      });
      return;
    }

    updateDeviceForm(roomId, {
      selectedPreset: selected,
      deviceName: selected,
      deviceCategory: selected,
      deviceWatts: deviceDefaults[selected]
        ? String(deviceDefaults[selected])
        : "",
    });
  }

  function saveDevice(floorId: number, roomId: number) {
    const form = getDeviceForm(roomId);

    if (
      !form.deviceName ||
      !form.deviceCategory ||
      !form.deviceWatts ||
      !form.deviceQuantity ||
      (consumptionMode === "monthly" && !form.deviceHours)
    ) {
      alert("Please fill all required device information.");
      return;
    }

    const watts = Number(form.deviceWatts);
    const hours = consumptionMode === "monthly" ? Number(form.deviceHours) : 0;
    const quantity = Number(form.deviceQuantity);

    if (watts <= 0 || quantity <= 0) {
      alert("Watts and quantity must be greater than zero.");
      return;
    }

    if (consumptionMode === "monthly" && hours <= 0) {
      alert("Expected daily usage hours must be greater than zero.");
      return;
    }

    const monthlyKwh =
      consumptionMode === "monthly" ? (watts / 1000) * hours * 30 * quantity : 0;

    const newDevice: Device = {
      id: Date.now() + Math.floor(Math.random() * 1000000),
      name: form.deviceName.trim(),
      category: form.deviceCategory,
      watts,
      hours,
      quantity,
      monthlyKwh,
    };

    addDeviceToRoom(floorId, roomId, newDevice);

    alert("Device saved successfully.");
  }

  function validateProperty() {
    if (!propertyName.trim()) {
      alert("Please enter property name.");
      return false;
    }

    if (!country) {
      alert("Please select country.");
      return false;
    }

    if (!currency) {
      alert("Please select currency.");
      return false;
    }

    if (!electricityRate || Number(electricityRate) <= 0) {
      alert("Please enter valid electricity rate.");
      return false;
    }

    if (!propertyType) {
      alert("Please select property type.");
      return false;
    }

    if (floors.length === 0) {
      alert("Please generate floors first.");
      return false;
    }

    const hasRooms = floors.some((floor) => floor.rooms.length > 0);

    if (!hasRooms) {
      alert("Please add at least one room.");
      return false;
    }

    return true;
  }

  function saveProperty(redirectTo?: string) {
    if (!validateProperty()) return;
    if (saving) return;

    setSaving(true);

    try {
      const editPropertyId = localStorage.getItem("editPropertyId");
      const activePropertyId = localStorage.getItem("activePropertyId");
      const propertyId = editPropertyId || activePropertyId || Date.now().toString();

      const propertyData = {
        id: propertyId,
        propertyName: propertyName.trim(),
        country,
        currency,
        electricityRate: Number(electricityRate),
        propertyType,
        consumptionMode,
        numberOfFloors,
        hasBasement,
        hasRoof,
        floors,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const oldProperties = JSON.parse(
        localStorage.getItem("properties") || "[]"
      );

      const exists = oldProperties.some(
        (property: any) => property.id === propertyId
      );

      const updatedProperties = exists
        ? oldProperties.map((property: any) =>
            property.id === propertyId ? propertyData : property
          )
        : [propertyData, ...oldProperties];

      localStorage.setItem("properties", JSON.stringify(updatedProperties));
      localStorage.setItem("activeProperty", JSON.stringify(propertyData));
      localStorage.setItem("activePropertyId", propertyData.id);
      localStorage.setItem("editPropertyId", propertyData.id);

      alert("Property saved successfully!");

      if (redirectTo) router.push(redirectTo);
    } catch (error) {
      console.error(error);
      alert("Error saving property.");
    } finally {
      setSaving(false);
    }
  }

  function renderManualForm(floorId: number, roomId: number) {
    const form = getDeviceForm(roomId);

    return (
      <div className="mt-4 bg-green-50 p-4 rounded-xl">
        <label className="block text-sm font-semibold text-gray-500 mb-1">
          Device Type
        </label>

        <select
          value={form.selectedPreset}
          onChange={(e) => handleDeviceTypeChange(roomId, e.target.value)}
          className="w-full border p-3 rounded-xl mb-3 text-gray-700"
        >
          <option value="">Select Device Type</option>
          {deviceTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="block text-sm font-semibold text-gray-500 mb-1">
          Device Name
        </label>

        <input
          value={form.deviceName}
          onChange={(e) =>
            updateDeviceForm(roomId, { deviceName: e.target.value })
          }
          placeholder="Example: Kitchen Refrigerator"
          className="w-full border p-3 rounded-xl mb-3 placeholder-gray-400"
        />

        <label className="block text-sm font-semibold text-gray-500 mb-1">
          Power Consumption Unit: Watts (W)
        </label>

        <input
          value={form.deviceWatts}
          onChange={(e) =>
            updateDeviceForm(roomId, { deviceWatts: e.target.value })
          }
          type="number"
          placeholder="Example: 1800 W"
          className="w-full border p-3 rounded-xl mb-3 placeholder-gray-400"
        />

        {consumptionMode === "monthly" && (
          <>
            <label className="block text-sm font-semibold text-gray-500 mb-1">
              Expected Daily Usage Unit: Hours/day
            </label>

            <input
              value={form.deviceHours}
              onChange={(e) =>
                updateDeviceForm(roomId, { deviceHours: e.target.value })
              }
              type="number"
              placeholder="Example: 8 hours/day"
              className="w-full border p-3 rounded-xl mb-3 placeholder-gray-400"
            />
          </>
        )}

        <label className="block text-sm font-semibold text-gray-500 mb-1">
          Quantity Unit: Number of devices
        </label>

        <input
          value={form.deviceQuantity}
          onChange={(e) =>
            updateDeviceForm(roomId, { deviceQuantity: e.target.value })
          }
          type="number"
          placeholder="Example: 1"
          className="w-full border p-3 rounded-xl mb-3 placeholder-gray-400"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => saveDevice(floorId, roomId)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Save Device
          </button>

          <button
            type="button"
            onClick={() => {
              resetDeviceForm(roomId);
              alert("Form cleared. Add a new device.");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Device
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ⚡ Property Designer
        </h1>

        <p className="text-gray-700 mb-8 max-w-4xl">
          Configure your property settings, select consumption mode, create
          floors, add rooms, and add devices.
        </p>

        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Step 1: Property Settings
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Property Name"
              className="w-full border p-3 rounded-xl"
            />

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border p-3 rounded-xl"
            >
              <option value="">Select Country</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="UAE">UAE</option>
              <option value="Qatar">Qatar</option>
              <option value="USA">USA</option>
            </select>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border p-3 rounded-xl"
            >
              <option value="">Select Currency</option>
              <option value="KWD">KWD</option>
              <option value="SAR">SAR</option>
              <option value="AED">AED</option>
              <option value="QAR">QAR</option>
              <option value="USD">USD</option>
            </select>

            <input
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
              type="number"
              step="0.001"
              placeholder="Electricity Rate per kWh"
              className="w-full border p-3 rounded-xl"
            />

            <div className="md:col-span-4">
              <label className="block font-semibold mb-2">
                Consumption Mode
              </label>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setConsumptionMode("monthly")}
                  className={`px-6 py-3 rounded-xl border font-semibold ${
                    consumptionMode === "monthly"
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-green-50"
                  }`}
                >
                  Monthly Property Consumption
                </button>

                <button
                  type="button"
                  onClick={() => setConsumptionMode("daily")}
                  className={`px-6 py-3 rounded-xl border font-semibold ${
                    consumptionMode === "daily"
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-green-50"
                  }`}
                >
                  Fill in Daily Property Consumption
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Monthly mode requires expected hours/day. Daily mode hides hours
                here and lets the user enter actual hours later.
              </p>
            </div>
          </div>
        </div>

        <div
          className={`bg-white p-6 rounded-2xl shadow mb-8 ${
            !step1Completed ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">
            Step 2: Select Property Type
          </h2>

          <div className="flex flex-wrap gap-4">
            {["Villa", "Apartment", "Office", "Shop", "Workshop"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => selectPropertyType(type)}
                  className={`px-6 py-3 rounded-xl border font-semibold ${
                    propertyType === type
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-green-50"
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div
            className={`bg-white p-6 rounded-2xl shadow ${
              !step2Completed ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">
              Step 3: Create Property Floors
            </h2>

            <input
              value={numberOfFloors}
              onChange={(e) => setNumberOfFloors(e.target.value)}
              type="number"
              min="1"
              className="w-full border p-3 rounded-xl mb-4"
            />

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setHasBasement(true)}
                className={`px-5 py-2 rounded-xl border ${
                  hasBasement ? "bg-green-600 text-white" : "bg-white"
                }`}
              >
                Basement Yes
              </button>

              <button
                onClick={() => setHasBasement(false)}
                className={`px-5 py-2 rounded-xl border ${
                  !hasBasement ? "bg-green-600 text-white" : "bg-white"
                }`}
              >
                Basement No
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setHasRoof(true)}
                className={`px-5 py-2 rounded-xl border ${
                  hasRoof ? "bg-green-600 text-white" : "bg-white"
                }`}
              >
                Roof Yes
              </button>

              <button
                onClick={() => setHasRoof(false)}
                className={`px-5 py-2 rounded-xl border ${
                  !hasRoof ? "bg-green-600 text-white" : "bg-white"
                }`}
              >
                Roof No
              </button>
            </div>

            <button
              onClick={generateFloors}
              className="bg-green-600 text-white px-6 py-3 rounded-xl"
            >
              Generate Floors
            </button>
          </div>

          <div
            className={`bg-white p-6 rounded-2xl shadow ${
              !step3Completed ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Step 4: Add Room</h2>

            <select
              value={selectedFloorId ?? ""}
              onChange={(e) => setSelectedFloorId(Number(e.target.value))}
              className="w-full border p-3 rounded-xl mb-4"
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>

            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Example: Living Room"
              className="w-full border p-3 rounded-xl mb-4"
            />

            <button
              onClick={addRoom}
              className="bg-green-600 text-white px-6 py-3 rounded-xl"
            >
              Add Room
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Property Layout</h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => saveProperty("/monthly_property_consumption")}
                disabled={consumptionMode !== "monthly"}
                className={`px-6 py-3 rounded-xl ${
                  consumptionMode === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                Monthly Property Consumption
              </button>

              <button
                onClick={() =>
                  saveProperty("/fill_in_daily_property_consumption")
                }
                disabled={consumptionMode !== "daily"}
                className={`px-6 py-3 rounded-xl ${
                  consumptionMode === "daily"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                Fill in Daily Property Consumption
              </button>

              <button
                onClick={() => saveProperty()}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded-xl"
              >
                {saving ? "Saving..." : "💾 Save Property"}
              </button>
            </div>
          </div>

          {floors.length === 0 ? (
            <p className="text-gray-500">
              Complete Step 1, Step 2, then generate floors.
            </p>
          ) : (
            <div className="space-y-6">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  className="border rounded-2xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-green-600">
                      {floor.name}
                    </h3>

                    <button
                      onClick={() => deleteFloor(floor.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete Floor
                    </button>
                  </div>

                  {floor.rooms.length === 0 ? (
                    <p className="text-gray-500">No rooms added yet.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {floor.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="bg-white border rounded-xl p-4 shadow-sm"
                        >
                          <h4 className="font-bold text-lg">{room.name}</h4>

                          <div className="space-y-2 mt-3">
                            {!roomMethods[room.id] && (
                              <>
                                <button
                                  onClick={() =>
                                    setRoomMethodForRoom(room.id, "manual")
                                  }
                                  className="w-full bg-green-600 text-white py-2 rounded-lg"
                                >
                                  ✍ Manual Entry
                                </button>

                                <button
                                  onClick={() =>
                                    setRoomMethodForRoom(room.id, "photo")
                                  }
                                  className="w-full bg-blue-600 text-white py-2 rounded-lg"
                                >
                                  📷 Scan Photo
                                </button>
                              </>
                            )}

                            {roomMethods[room.id] && (
                              <button
                                onClick={() => clearRoomMethod(room.id)}
                                className="w-full bg-gray-700 text-white py-2 rounded-lg"
                              >
                                Change Method
                              </button>
                            )}
                          </div>

                          {roomMethods[room.id] === "manual" &&
                            renderManualForm(floor.id, room.id)}

                          {roomMethods[room.id] === "photo" && (
                            <div className="mt-4 bg-blue-50 p-4 rounded-xl">
                              <p className="font-semibold mb-2">
                                Photo scan will be added later.
                              </p>
                            </div>
                          )}

                          {room.devices.length > 0 && (
                            <div className="mt-4 border-t pt-3">
                              <p className="font-semibold mb-2">
                                Saved Devices
                              </p>

                              <div className="space-y-2">
                                {room.devices.map((device) => (
                                  <div
                                    key={device.id}
                                    className="bg-gray-100 p-3 rounded-lg text-sm"
                                  >
                                    <p className="font-bold">
                                      {device.name}{" "}
                                      <span className="text-gray-500">
                                        ({device.category})
                                      </span>
                                    </p>

                                    <p>
                                      {device.watts}W
                                      {consumptionMode === "monthly"
                                        ? ` × ${device.hours}h/day`
                                        : ""}
                                      {" × "}
                                      {device.quantity}
                                    </p>

                                    {consumptionMode === "monthly" ? (
                                      <p className="text-blue-700 font-semibold">
                                        {device.monthlyKwh.toFixed(2)}{" "}
                                        kWh/month
                                      </p>
                                    ) : (
                                      <p className="text-blue-700 font-semibold">
                                        Daily mode: hours will be entered later.
                                      </p>
                                    )}

                                    <button
                                      onClick={() =>
                                        deleteDevice(
                                          floor.id,
                                          room.id,
                                          device.id
                                        )
                                      }
                                      className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                      Delete Device
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => deleteRoom(floor.id, room.id)}
                            className="mt-4 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
                          >
                            Delete Room
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}