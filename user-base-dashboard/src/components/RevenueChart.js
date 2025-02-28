import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RevenueChart = ({ data }) => {
  {/* if (!data || data.length === 0) return <p>No data available for visualization.</p>; */}

  return (
    <div class="plot">
      <ResponsiveContainer width="100%" height={200} class="plot-container">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total_revenue" 
            stroke="#4caf50" 
            name="Total Revenue"             
            strokeWidth={1}
            dot={{ r: 0, fill: '#4caf50' }} // Custom dot styling
            activeDot={{ r: 8, fill: '#4caf50' }} // Active dot styling
          />
          <Line 
            type="monotone" 
            dataKey="daily_reinvest" 
            stroke="#f44336" 
            name="Reinvestment" 
            strokeWidth={1}
            dot={{ r: 0, fill: '#f44336' }} // Custom dot styling
            activeDot={{ r: 8, fill: '#f44336' }} // Active dot styling
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

