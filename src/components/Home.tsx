import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Page A", uv: 4000 },
  { name: "Page B", uv: 3000 },
  { name: "Page C", uv: 2000 },
];

export default function Home() {
  return (
    <>
      <h1 className="mt-20">Home</h1>
      <div className="bg-white text-black dark:bg-gray-900 dark:text-white">
        This will have different backgrounds and text colors in light and dark
        modes.
      </div>
      <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">My Line Chart</h2>
        <LineChart width={500} height={300} data={data} className="w-full">
          <XAxis dataKey="name" stroke="#4B5563" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
        <p className="mt-4 text-gray-600">
          Data visualization example using Recharts and Tailwind CSS.
        </p>
      </div>
    </>
  );
}
