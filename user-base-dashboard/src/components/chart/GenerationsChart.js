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
import React, { useState, useEffect } from "react";

const GenerationsChart = ({ 
  data,
  isProcessing,
  setIsProcessing,
  err,
  setErr,
 }) => {
  const [generation, setGeneration] = useState(1);
  const [logbook, setLogbook] = useState([]);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/api/optimize");
          if (!response.ok) throw new Error("Failed to fetch optimization progress.");
          
          const data = await response.json();
          setGeneration(data.generation);
          setLogbook(data.logbook);
        } catch (error) {
          setErr(error.message);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isProcessing]);


  return (
    <div className="generation-plot">
        <ResponsiveContainer className="generation-graph" width="100%" height={150}>
          <LineChart data={logbook.map(log => ({ gen: log.gen, min: log.min, max: log.max, mean: log.mean }))}>
          <XAxis dataKey="gen" label={{ value: "Generation", position: "insideBottomRight", offset: 0 }} />
          <YAxis label={{ value: "Penalty", angle: -90, position: "insideBottomCenter", offset: 50 }} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="min" 
            stroke="green" 
            strokeWidth={2}
            dot={{ r: 1, fill: 'green' }} // Custom dot styling
          />
          <Line 
            type="monotone" 
            dataKey="mean" 
            stroke="blue" 
            strokeWidth={2}
            dot={{ r: 1, fill: 'blue' }} // Custom dot styling
          />
          <Line 
            type="monotone" 
            dataKey="max" 
            stroke="red" 
            strokeWidth={2} 
            dot={{ r: 1, fill: 'red' }} // Custom dot styling
 
          />
        </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default GenerationsChart;

