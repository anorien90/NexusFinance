import React from 'react';
import './UserBaseChart.css'; // Import the custom styles
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserBaseChart = ({ data }) => {

  return (
    <div class="plot">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Line for Daily Revenue */}
          <Line
            type="monotone"
            dataKey="total_cost"
            stroke="#ff7043"
            name="Total Investment"
            strokeWidth={1}
            dot={{ r: 0, fill: '#ff7043' }} // Custom dot styling
            activeDot={{ r: 8, fill: '#d32f2f' }} // Active dot styling
          />
          {/* Line for Total Revenue */}
          <Line
            type="monotone"
            dataKey="total_reinvest"
            name="Total Reinvestment"
            stroke="#2196f3"
            strokeWidth={1}
            dot={{ r: 0, fill: '#2196f3' }} // Custom dot styling
            activeDot={{ r: 8, fill: '#1976d2' }} // Active dot styling
          />
          <Line
            type="monotone"
            dataKey="return_of_invest"
            name="Return of Investment"
            stroke="green"
            strokeWidth={1}
            dot={{ r: 0, fill: 'green' }} // Custom dot styling
            activeDot={{ r: 8, fill: 'green' }} // Active dot styling
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserBaseChart;

