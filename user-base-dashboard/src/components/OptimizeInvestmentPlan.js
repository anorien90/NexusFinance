import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import GenerateButton from "./button/GenerateButton";

const OptimizeInvestmentPlan = ({
  investmentPlan,
  setInvestmentPlan,
  isProcessing,
  setIsProcessing,
  err,
  setErr,
  strategy: initialStrategy, // Renamed to avoid conflicts
}) => {
  // Local state for strategy so we can update it dynamically
  const [strategy, setStrategy] = useState({
    initial_invest: initialStrategy?.initial_invest || [1000, 50000],
    reinvest_rate: initialStrategy?.reinvest_rate || [0.2, 0.8],
    cost_per_install: initialStrategy?.cost_per_install || 2.0,
    target_day: initialStrategy?.target_day || 365,
    target_user: initialStrategy?.target_user || 10000,
    invest_days: initialStrategy?.invest_days || [0, 365],
    reinvest_days: initialStrategy?.reinvest_days || [0, 300],
    num_extra_invest: initialStrategy?.num_extra_invest || [0, 24],
    num_reinvest: initialStrategy?.num_reinvest || [0, 24],
    extra_invest: initialStrategy?.extra_invest || [1000, 100000],
    extra_invest_days: initialStrategy?.extra_invest_days || [30, 300],
    population: initialStrategy?.population || 50,
    generations: initialStrategy?.generations || 20,
    mut_prop: initialStrategy?.mut_prop || 0.2,
  });

  const [generation, setGeneration] = useState(1);
  const [logbook, setLogbook] = useState([]);

  // Function to handle input changes
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setStrategy((prev) => ({
      ...prev,
      [field]: Number(value), // Convert to number if needed
    }));
  };

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/api/optimize");
          if (!response.ok) throw new Error("Failed to fetch optimization progress.");
          
          const data = await response.json();
          setGeneration(data.generation);
          setLogbook(data.logbook);
          setIsProcessing(data.processing);
        } catch (error) {
          setErr(error.message);
        }
      }, 20000);

      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleOptimize = async () => {
    setIsProcessing(true);
    setErr(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(strategy),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize investment plan.");
      }

      const result = await response.json();
      setInvestmentPlan(result);
    } catch (error) {
      setErr(error.message);
    }
  };

  const handleStopOptimization = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processing: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to stop optimization.");
      }

      setIsProcessing(false);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
  <div className="optimize-investment-plan">
    <div className="optimize-actions">
      <table className="optimize-settings">
        <thead>
          <tr>
            <th>Population</th>
            <th>Generations</th>
            <th>Mutation Probability</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input 
                type="number"
                value={strategy.population} 
                onChange={(e) => handleInputChange(e, "population")} 
              />
            </td>
            <td>
              <input 
                type="number"
                value={strategy.generations} 
                onChange={(e) => handleInputChange(e, "generations")} 
              />
            </td>
            <td className="mutation-setting">
              <input 
                type="number"
                step="0.01"
                value={strategy.mut_prop} 
                onChange={(e) => handleInputChange(e, "mut_prop")} 
              />
            </td>
          </tr>
        </tbody>
      </table>
      <GenerateButton handleOptimize={handleOptimize} isProcessing={isProcessing} />
        <button
          onClick={handleStopOptimization}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 ml-2"
          disabled={!isProcessing}
        >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          height="2.25rem" 
          viewBox="0 -960 960 960" 
          width="2.25rem" 
          fill={isProcessing ? "rgba(255, 0, 0, 1)" : "rgba(255, 0, 0, .5)"}>
        <path 
          d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
      </button>
  

    </div>
    
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
     {err && <p className="text-red-500 mt-4">{err}</p>}
    </div>
  );
};

export default OptimizeInvestmentPlan;

