import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RevenueAndCostChart = ({ data }) => {

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md" class="plot">
      <h2 className="text-xl font-bold mb-4">Revenue and Cost Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total_cost" 
            stroke="#4caf50" 
            name="Total Cost"             
            strokeWidth={1}
            dot={{ r: 0, fill: '#4caf50' }} // Custom dot styling
            activeDot={{ r: 8, fill: '#4caf50' }} // Active dot styling
          />
          <Line 
            type="monotone" 
            dataKey="total_reinvest" 
            stroke="#f44336" 
            name="Total Reinvestment" 
            strokeWidth={1}
            dot={{ r: 0, fill: '#f44336' }} // Custom dot styling
            activeDot={{ r: 8, fill: '#f44336' }} // Active dot styling
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueAndCostChart;

