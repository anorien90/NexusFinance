import React, { useEffect, useState, useRef } from "react";
import InvestmentPlan from "./InvestmentPlan";
import OptimizeInvestmentPlan from "./OptimizeInvestmentPlan";

const SimulateForm = ({ 
  investmentPlan, 
  setInvestmentPlan, 
  isProcessing,
  setIsProcessing,
  err,
  setErr,
  strategy,
}) => {
  const [status, setStatus] = useState(null);
  const intervalRef = useRef(null); // Store polling interval

  // Poll Simulation Status
  const pollStatus = () => {
    // Clear any existing interval before starting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/status");
        if (!response.ok) throw new Error("Failed to fetch status.");

        const data = await response.json();
        setStatus(data);

        // Stop polling when simulation is complete
        if (!data.processing) {
          setIsProcessing(false);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (error) {
        setErr(`Error fetching status: ${error.mess age}`);
        setIsProcessing(false);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2000); // Poll every 2 seconds
  };

  // Cleanup polling when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="simulation-form">
      <h2>Simulation</h2>

      {/* Show Simulation Status */}
      {isProcessing ? <p>Simulation is running...</p> : <p>Simulation complete.</p>}
      {status && <p>Current Generation: {status.generation}</p>}
      {err && <p className="error">{err}</p>}

      {/* Investment Plan Component */}
         </div>
  );
};

export default SimulateForm;

