import React, { useState, useEffect, useRef } from "react";

const InvestmentPlan = ({
  investmentPlan,
  setInvestmentPlan,
  isProcessing,
  setIsProcessing,
  err,
  setErr,
}) => {
  const [day, setDay] = useState(0);
  const [investment, setInvestment] = useState(0);
  const [reinvestmentRate, setReinvestmentRate] = useState(0.0);
  const [showSchedule, setShowSchedule] = useState(false);
  const scheduleRef = useRef(null);

 const toggleScheduleVisibility = () => {
    setShowSchedule(!showSchedule);
  };

  const handleAddPlan = () => {
    if (day === "" || investment === "" || reinvestmentRate === "") {
      return; // Avoid adding invalid data
    }

  const updatedPlan = {
      ...investmentPlan,
      [day]: {
        investment: parseFloat(investment),
        reinvestment_rate: parseFloat(reinvestmentRate),
      },
    };

    setInvestmentPlan(updatedPlan);
    setDay(0);
    setInvestment(0);
    setReinvestmentRate(0.0);
  };

  const handleDeletePlan = (dayToDelete) => {
    const updatedPlan = { ...investmentPlan }; // Clone the plan
    delete updatedPlan[dayToDelete]; // Delete the specified day entry
    setInvestmentPlan(updatedPlan); // Update state
  };

  const handleUploadPlan = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedPlan = JSON.parse(e.target.result);
        setInvestmentPlan(uploadedPlan);
      } catch (error) {
        alert("Invalid JSON file. Please upload a valid investment plan.");
      }
    };
    reader.readAsText(file);
  };

  const handleSavePlan = () => {
    const data = JSON.stringify(investmentPlan, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "investment-plan.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startSimulation = async () => {
    setIsProcessing(true);
    setErr(null);
  
    try {
      console.log("Sending request to simulation API...");
      
      const response = await fetch("http://127.0.0.1:5000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investment_plan: investmentPlan }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text(); // Read response body
        throw new Error(`Failed to start simulation: ${errorMessage}`);
      }
  
      console.log("Simulation started successfully.");
    } catch (error) {
      setErr(error.message);
      console.error("Error starting simulation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
      startSimulation();
  }, [investmentPlan]);


  return (
    <div className="investment-plan">
      <div className="investment-plan-head">
        <h2>InvestmentPlan</h2>
        <button
          onClick={toggleScheduleVisibility}
          disabled={isProcessing}
          className="mt-6 px-4 py-2 bg-gray-500 text-white font-semibold rounded hover:bg-gray-600"
        >
          {showSchedule ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="3.5vh"
              viewBox="0 -960 960 960"
              width="3.5vh"
              fill="#000000"
            >
              <path d="m280-400 200-200 200 200H280Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="3.5vh"
              viewBox="0 -960 960 960"
              width="3.5vh"
              fill="#000000"
            >
              <path d="M480-360 280-560h400L480-360Z" />
            </svg>
          )}
        </button>
      </div>
    {showSchedule && (
      <table className="investment-plan-schedule">
        <thead>
          <tr>
            <th>Day</th>
            <th>Investment</th>
            <th>Reinvest</th>
            <th>          
                <button
                  onClick={handleSavePlan}
                  disabled={isProcessing}
                  className="mt-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="2vh"
                    viewBox="0 -960 960 960"
                    width="2vh"
                    fill="#000000"
                  >
                    <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
                  </svg>
                </button>
            </th>
            <th>
             <label
                  htmlFor="upload-plan"
                  className="ml-4 mt-4 px-4 py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 cursor-pointer flex items-center"
                  disabled={isProcessing}
                >
                  <svg
                    disabled={isProcessing}
                    xmlns="http://www.w3.org/2000/svg"
                    height="2vh"
                    viewBox="0 -960 960 960"
                    width="2vh"
                    fill="#000000"
                  >
                    <path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="upload-plan"
                  accept="application/json"
                  onChange={handleUploadPlan}
                  className="hidden"
                  disabled={isProcessing}
                />
            
            </th>
          </tr>
        </thead>
        <tbody>
           <tr>
              <td>
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded mt-1"
                  min="0"
                  disabled={isProcessing}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded mt-1"
                  min="0"
                  step="0.01"
                  disabled={isProcessing}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reinvestmentRate}
                  onChange={(e) => setReinvestmentRate(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded mt-1"
                  min="0"
                  max="1"
                  step="0.01"
                  disabled={isProcessing}
                />
              </td>
              <td>
                <button
                  onClick={handleAddPlan}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
                  disabled={isProcessing}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="2.5vh"
                    viewBox="0 -960 960 960"
                    width="2.5vh"
                    fill="#000000"
                  >
                    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                  </svg>
                </button>
              </td>
            </tr>
         {showSchedule &&
            Object.entries(investmentPlan).map(([day, plan]) => (
              <tr key={day}>
                <td>{day}</td>
                <td>{plan.investment.toFixed(2)}</td>
                <td>{(plan.reinvestment_rate * 100).toFixed(2)}%</td>
                <td>
                  <button
                    onClick={() => handleDeletePlan(day)}
                    className="ml-4 px-2 py-1 bg-red-500 text-white font-semibold rounded hover:bg-red-600"
                    disabled={isProcessing}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="2vh"
                      viewBox="0 -960 960 960"
                      width="2vh"
                      fill="#000000"
                    >
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </div>
  );
};

export default InvestmentPlan;

