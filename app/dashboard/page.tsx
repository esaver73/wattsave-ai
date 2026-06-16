"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

type UsageRecord = {
  id: string;
  date: string;
  propertyId: string;
  propertyName: string;
  deviceName: string;
  roomName: string;
  floorName?: string;
  hoursUsed: number;
  kWh: number;
  cost: number;
};

type BillComparison = {
  actualKwh: number;
  actualCost: number;
  differenceKwh: number;
  differenceCost: number;
  differencePercent: number;
  status: string;
  action: string;
};

const COLORS = [
  "#16a34a",
  "#2563eb",
  "#f97316",
  "#dc2626",
  "#9333ea",
  "#ca8a04",
];

const forecastMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Dashboard() {
  const router = useRouter();

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  const [actualKwh, setActualKwh] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [billComparison, setBillComparison] =
    useState<BillComparison | null>(null);
  const [comparisonHistory, setComparisonHistory] = useState<any[]>([]);

  const [billFile, setBillFile] = useState<File | null>(null);
  const [billFileName, setBillFileName] = useState("");
  const [billAnalysis, setBillAnalysis] = useState("");

  const [dailyRecords, setDailyRecords] = useState<UsageRecord[]>([]);
useEffect(() => {
  loadProperty();
  loadComparisonHistory();
  loadDailyRecords();
}, []);
  function loadProperty() {
    try {
      const saved = localStorage.getItem("activeProperty");
      if (saved) setProperty(JSON.parse(saved));
    } catch (error) {
      console.error(error);
      alert("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  function loadComparisonHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem("billComparisons") || "[]");
      setComparisonHistory(saved);
    } catch (error) {
      console.error(error);
    }
  }

  function loadDailyRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem("dailyUsage") || "[]");
      setDailyRecords(saved);
    } catch (error) {
      console.error(error);
    }
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function getDateString(date: Date) {
    return date.toISOString().split("T")[0];
  }

  function getBillStatus(differencePercent: number) {
    if (differencePercent > 15) return "Higher than WattSave estimate";
    if (differencePercent < -15) return "Lower than WattSave estimate";
    return "Close to WattSave estimate";
  }

  function getBillAction(differencePercent: number) {
    if (differencePercent > 15) {
      return "Your actual bill is much higher than the WattSave estimate. Check AC operating hours, high-consumption rooms, and devices running longer than expected.";
    }

    if (differencePercent < -15) {
      return "Your actual bill is lower than the WattSave estimate. This means your real usage is better than the expected monthly usage.";
    }

    return "Your actual bill is close to the WattSave estimate. Continue tracking daily usage to improve accuracy.";
  }

  const today = getDateString(new Date());

  const propertyName = property?.propertyName || "No property selected";
  const propertyId = property?.id || "";
  const currency = property?.currency || "KWD";
  const rate = property?.electricityRate || 0.002;

  const allRooms =
    property?.floors.flatMap((floor) =>
      floor.rooms.map((room) => ({
        ...room,
        floorName: floor.name,
      }))
    ) || [];

  const allDevices = allRooms.flatMap((room) =>
    (room.devices || []).map((device) => ({
      ...device,
      category: device.category || "Other",
      roomName: room.name,
      floorName: room.floorName,
    }))
  );

  const totalKwh = allDevices.reduce(
    (sum, device) => sum + (device.monthlyKwh || 0),
    0
  );

  const monthlyCost = totalKwh * rate;
  const annualCost = monthlyCost * 12;

  const propertyDailyRecords = dailyRecords.filter(
    (record) => record.propertyId === propertyId
  );

  const todayDailyRecords = propertyDailyRecords.filter(
    (record) => record.date === today
  );

  const todayDailyKwh = todayDailyRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const todayDailyCost = todayDailyRecords.reduce(
    (sum, record) => sum + record.cost,
    0
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const weekDailyRecords = propertyDailyRecords.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= sevenDaysAgo && recordDate <= new Date();
  });

  const weekDailyKwh = weekDailyRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const currentMonth = today.slice(0, 7);

  const monthDailyRecords = propertyDailyRecords.filter((record) =>
    record.date.startsWith(currentMonth)
  );

  const monthDailyKwh = monthDailyRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const dailyTrendData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    const dateString = getDateString(date);

    const dayRecords = propertyDailyRecords.filter(
      (record) => record.date === dateString
    );

    return {
      date: dateString.slice(5),
      kWh: Number(
        dayRecords.reduce((sum, record) => sum + record.kWh, 0).toFixed(2)
      ),
    };
  });

  const forecastData = forecastMonths.map((month) => ({
    month,
    cost: Number(monthlyCost.toFixed(3)),
    kWh: Number(totalKwh.toFixed(2)),
  }));

  const categoryChartData = Object.values(
    allDevices.reduce((acc, device) => {
      const category = device.category || "Other";

      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }

      acc[category].value += device.monthlyKwh || 0;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).map((item) => ({
    ...item,
    value: Number(item.value.toFixed(2)),
  }));

  const roomChartData = allRooms.map((room) => {
    const roomKwh = (room.devices || []).reduce(
      (sum, device) => sum + (device.monthlyKwh || 0),
      0
    );

    return {
      name: room.name,
      kWh: Number(roomKwh.toFixed(2)),
    };
  });

  const topConsumers = [...allDevices]
    .sort((a, b) => b.monthlyKwh - a.monthlyKwh)
    .slice(0, 5);

  function uploadElectricityBill(file: File) {
    setBillFile(file);
    setBillFileName(file.name);
    setBillAnalysis("");
    alert("Bill selected successfully. Now enter actual kWh and actual cost.");
  }

  function analyzeBill() {
    if (!billFile) {
      alert("Please upload an electricity bill first.");
      return;
    }

    setBillAnalysis(
      "Bill uploaded successfully. Enter the actual monthly kWh and actual monthly cost, then click Compare With WattSave to generate the analysis."
    );
  }

  function compareElectricityBill() {
    const actualMonthlyKwh = Number(actualKwh);
    const actualMonthlyCost = Number(actualCost);

    if (!actualMonthlyKwh || !actualMonthlyCost) {
      alert("Please enter actual monthly kWh and actual monthly cost.");
      return;
    }

    const differenceKwh = actualMonthlyKwh - totalKwh;
    const differenceCost = actualMonthlyCost - monthlyCost;
    const differencePercent =
      totalKwh > 0 ? (differenceKwh / totalKwh) * 100 : 0;

    const status = getBillStatus(differencePercent);
    const action = getBillAction(differencePercent);

    const comparison: BillComparison = {
      actualKwh: actualMonthlyKwh,
      actualCost: actualMonthlyCost,
      differenceKwh,
      differenceCost,
      differencePercent,
      status,
      action,
    };

    setBillComparison(comparison);

    setBillAnalysis(
      `WattSave Bill Analysis

Status: ${status}

Estimated monthly consumption: ${totalKwh.toFixed(2)} kWh
Actual bill consumption: ${actualMonthlyKwh.toFixed(2)} kWh
Difference: ${differenceKwh.toFixed(2)} kWh
Difference percentage: ${differencePercent.toFixed(2)}%

Estimated monthly cost: ${monthlyCost.toFixed(3)} ${currency}
Actual bill cost: ${actualMonthlyCost.toFixed(3)} ${currency}
Cost difference: ${differenceCost.toFixed(3)} ${currency}

Suggested action:
${action}`
    );

    const historyItem = {
      id: Date.now().toString(),
      propertyName,
      actualMonthlyKwh,
      actualMonthlyCost,
      estimatedMonthlyKwh: totalKwh,
      estimatedMonthlyCost: monthlyCost,
      differenceKwh,
      differenceCost,
      differencePercent,
      status,
      action,
      currency,
      createdAt: new Date().toISOString(),
    };

    const oldHistory = JSON.parse(localStorage.getItem("billComparisons") || "[]");

    localStorage.setItem(
      "billComparisons",
      JSON.stringify([historyItem, ...oldHistory])
    );

    loadComparisonHistory();
    alert("Bill comparison and analysis saved successfully.");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-600 mb-3">
              ⚡ WattSave Dashboard
            </h1>

            <p className="text-gray-600">
              Current Property:{" "}
              <span className="font-bold text-gray-800">{propertyName}</span>
            </p>
          </div>

          <button
            onClick={() => router.push("/monthly_property_consumption")}
            className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800"
          >
            Change Property
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-8 sticky top-24 z-20">
          <div className="flex flex-wrap gap-3">
            {[
              ["overview", "Overview"],
              ["daily", "Daily Consumption"],
              ["bill", "Bill"],
              ["history", "History"],
              ["forecast", "Forecast"],
              ["charts", "Charts"],
              ["top-consumers", "Top Consumers"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow">
            Loading dashboard data...
          </div>
        ) : !property ? (
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-2">No Energy Data Yet</h2>
            <p className="text-gray-600 mb-4">
              Choose a property from Monthly Property Consumption first.
            </p>

            <button
              onClick={() => router.push("/monthly_property_consumption")}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
            >
              Go to Monthly Property Consumption
            </button>
          </div>
        ) : (
          <>
            <section id="overview">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow">
                  <p className="text-gray-500 mb-2">Estimated Monthly Energy</p>
                  <h2 className="text-4xl font-bold text-blue-600">
                    {totalKwh.toFixed(2)} kWh
                  </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                  <p className="text-gray-500 mb-2">Estimated Monthly Cost</p>
                  <h2 className="text-4xl font-bold text-green-600">
                    {monthlyCost.toFixed(3)} {currency}
                  </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                  <p className="text-gray-500 mb-2">Estimated Annual Cost</p>
                  <h2 className="text-4xl font-bold text-red-600">
                    {annualCost.toFixed(3)} {currency}
                  </h2>
                </div>
              </div>
            </section>

            <section id="daily">
              <div className="bg-white p-8 rounded-2xl shadow mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Daily Consumption Summary
                  </h2>

                  <button
                    onClick={() =>
                      router.push("/fill_in_daily_property_consumption")
                    }
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
                  >
                    Fill in Daily Property Consumption
                  </button>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-2xl shadow">
                    <p className="text-gray-600 mb-2">Today Energy</p>
                    <h2 className="text-2xl font-bold text-blue-700">
                      {todayDailyKwh.toFixed(2)} kWh
                    </h2>
                  </div>

                  <div className="bg-green-50 p-6 rounded-2xl shadow">
                    <p className="text-gray-600 mb-2">Today Cost</p>
                    <h2 className="text-2xl font-bold text-green-700">
                      {todayDailyCost.toFixed(3)} {currency}
                    </h2>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-2xl shadow">
                    <p className="text-gray-600 mb-2">This Week Energy</p>
                    <h2 className="text-2xl font-bold text-purple-700">
                      {weekDailyKwh.toFixed(2)} kWh
                    </h2>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-2xl shadow">
                    <p className="text-gray-600 mb-2">This Month Energy</p>
                    <h2 className="text-2xl font-bold text-orange-700">
                      {monthDailyKwh.toFixed(2)} kWh
                    </h2>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">
                  Last 7 Days Consumption Trend
                </h3>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrendData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="kWh" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section id="bill">
              <div className="bg-white p-8 rounded-2xl shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Upload Electricity Bill
                </h2>

                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="border p-3 rounded-xl w-full mb-4"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadElectricityBill(file);
                  }}
                />

                {billFileName && (
                  <div className="bg-blue-50 p-4 rounded-xl mt-4">
                    <p className="font-bold">Selected Bill</p>
                    <p>{billFileName}</p>

                    <button
                      onClick={analyzeBill}
                      className="block bg-purple-600 text-white px-6 py-3 rounded-xl mt-4 hover:bg-purple-700"
                    >
                      Analyze Bill
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl mt-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Electricity Bill Comparison
                  </h2>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <input
                      value={actualKwh}
                      onChange={(e) => setActualKwh(e.target.value)}
                      type="number"
                      placeholder="Actual monthly kWh"
                      className="border p-3 rounded-xl"
                    />

                    <input
                      value={actualCost}
                      onChange={(e) => setActualCost(e.target.value)}
                      type="number"
                      placeholder={`Actual monthly cost (${currency})`}
                      className="border p-3 rounded-xl"
                    />

                    <button
                      onClick={compareElectricityBill}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                    >
                      Compare With WattSave
                    </button>
                  </div>
                </div>

                {billComparison && (
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">
                      Comparison Result
                    </h3>

                    <p>
                      Status: <strong>{billComparison.status}</strong>
                    </p>

                    <p>
                      Estimated Consumption:{" "}
                      <strong>{totalKwh.toFixed(2)} kWh</strong>
                    </p>

                    <p>
                      Actual Consumption:{" "}
                      <strong>{billComparison.actualKwh.toFixed(2)} kWh</strong>
                    </p>

                    <p>
                      Difference:{" "}
                      <strong>
                        {billComparison.differenceKwh.toFixed(2)} kWh
                      </strong>
                    </p>

                    <p>
                      Difference Percentage:{" "}
                      <strong>
                        {billComparison.differencePercent.toFixed(2)}%
                      </strong>
                    </p>

                    <p>
                      Cost Difference:{" "}
                      <strong>
                        {billComparison.differenceCost.toFixed(3)} {currency}
                      </strong>
                    </p>
                  </div>
                )}

                {billAnalysis && (
                  <div className="bg-purple-50 p-4 rounded-xl mt-4 whitespace-pre-line">
                    <h3 className="font-bold mb-2">AI Bill Analysis</h3>
                    <p>{billAnalysis}</p>
                  </div>
                )}
              </div>
            </section>

            <section id="history">
              <div className="bg-white p-8 rounded-2xl shadow mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  Bill Comparison History
                </h2>

                {comparisonHistory.length === 0 ? (
                  <p>No comparisons yet.</p>
                ) : (
                  <div className="space-y-3">
                    {comparisonHistory.map((item) => (
                      <div key={item.id} className="border rounded-xl p-4">
                        <p>
                          Property: <strong>{item.propertyName}</strong>
                        </p>
                        <p>Status: <strong>{item.status || "N/A"}</strong></p>
                        <p>
                          Actual Cost:{" "}
                          <strong>
                            {Number(item.actualMonthlyCost || 0).toFixed(3)}
                          </strong>{" "}
                          {item.currency}
                        </p>
                        <p>
                          Estimated Cost:{" "}
                          <strong>
                            {Number(item.estimatedMonthlyCost || 0).toFixed(3)}
                          </strong>{" "}
                          {item.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section id="forecast">
              <div className="bg-white p-8 rounded-2xl shadow mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  12-Month Energy Cost Forecast
                </h2>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section id="charts">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-8 rounded-2xl shadow">
                  <h2 className="text-2xl font-bold mb-6">
                    Energy by Category
                  </h2>

                  {categoryChartData.length === 0 ? (
                    <p className="text-gray-500">No category data yet.</p>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={110}
                            label
                          >
                            {categoryChartData.map((_, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow">
                  <h2 className="text-2xl font-bold mb-6">Energy by Room</h2>

                  {roomChartData.length === 0 ? (
                    <p className="text-gray-500">No room data yet.</p>
                  ) : (
                    <>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={roomChartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="kWh" fill="#2563eb" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4">
                          Room Consumption Details
                        </h3>

                        <div className="space-y-3">
                          {[...roomChartData]
                            .sort((a, b) => b.kWh - a.kWh)
                            .map((room) => {
                              const roomCost = room.kWh * rate;
                              const roomPercent =
                                totalKwh > 0
                                  ? ((room.kWh / totalKwh) * 100).toFixed(1)
                                  : "0";

                              return (
                                <div
                                  key={room.name}
                                  className="border rounded-xl p-4 flex justify-between items-center"
                                >
                                  <div>
                                    <p className="font-bold text-lg">
                                      {room.name}
                                    </p>

                                    <p className="text-gray-500">
                                      {roomPercent}% of total property
                                      consumption
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p className="font-bold text-blue-600">
                                      {room.kWh.toFixed(2)} kWh
                                    </p>

                                    <p className="text-green-600">
                                      {roomCost.toFixed(3)} {currency}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section id="top-consumers">
              <div className="bg-white p-8 rounded-2xl shadow mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  Top Energy Consumers
                </h2>

                {topConsumers.length === 0 ? (
                  <p className="text-gray-500">No devices added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topConsumers.map((device, index) => (
                      <div
                        key={device.id}
                        className="flex justify-between border-b pb-2"
                      >
                        <span>
                          #{index + 1} {device.name}{" "}
                          <span className="text-gray-500">
                            ({device.category || "Other"})
                          </span>
                        </span>

                        <span className="font-bold">
                          {device.monthlyKwh.toFixed(2)} kWh
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}