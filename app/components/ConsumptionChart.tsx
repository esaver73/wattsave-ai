"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Appliance = {
  name: string;
  monthlyKwh: number;
};

export default function ConsumptionChart({
  appliances,
}: {
  appliances: Appliance[];
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">
        Consumption by Appliance
      </h2>

      {appliances.length === 0 ? (
        <p className="text-gray-500">No appliance data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={appliances}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="monthlyKwh"
              fill="#16a34a"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}