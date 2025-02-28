import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActiveUserChart = ({ data, strategy }) => {

  if (!data || data.length === 0) return <p>No data available for visualization.</p>;

  // Extract strategy parameters
  const { target_day, target_user } = strategy || {};

  // Generate the optimal growth trajectory
  const generateOptimalGrowth = () => {
    if (!target_day || !target_user || data.length === 0) return [];

    const initialUserCount = data[0]?.total_user || 0;
    const days = data.map((d) => d.day);

    return days.map((day) => {
      const growthFactor = Math.min(day / target_day, 1); // Cap at 100%
      const predictedUsers = Math.round(initialUserCount + growthFactor * (target_user - initialUserCount));
      return { day, predictedUsers };
    });
  };

  const optimalGrowthData = generateOptimalGrowth();

  const maxActiveUsers = Math.max(...data.map((d) => d.total_user), 0);
  const maxPredictedUsers = Math.max(...optimalGrowthData.map((d) => d.predictedUsers), 0);

  const maxYValue = Math.max(maxActiveUsers, maxPredictedUsers) * 1.1; // Add 10% buffer

  return (
    <div className="plot">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, maxYValue]}/>
          <Tooltip />
          <Legend />

          {/* Line for Active Users */}
          <Line
            type="monotone"
            dataKey="total_user"
            name="Active Users"
            stroke="blue"
            strokeWidth={1}
            dot={{ r: 0, fill: "blue" }}
            activeDot={{ r: 2, fill: "blue" }}
          />

          {/* Line for Optimal Growth - Toggled */}
          <Line
              type="monotone"
              data={optimalGrowthData}
              dataKey="predictedUsers"
              name="Optimal Growth"
              stroke="green"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={{ r: 0, fill: "green" }}
              activeDot={{ r: 2, fill: "green" }}
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActiveUserChart;

