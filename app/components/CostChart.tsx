"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Appliance = {
  name: string;
  monthlyCost: number;
};

export default function CostChart({
  appliances,
}: {
  appliances: Appliance[];
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">
        Cost Distribution
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={appliances}
            dataKey="monthlyCost"
            nameKey="name"
            outerRadius={120}
            label
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}