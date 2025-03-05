import React, { useState, useEffect } from "react";
import "./style.css";
import OptimizeInvestmentPlan from "./components/OptimizeInvestmentPlan";
import UserBaseChart from "./components/UserBaseChart";
import RevenueChart from "./components/RevenueChart";
import ActiveUserChart from "./components/ActiveUserChart";
import UserDistributionChart from "./components/UserDistributionChart";
import UserBaseOverview from "./components/UserBaseOverview";
import StrategySettings from "./components/StrategySettings";
import InvestmentPlan from "./components/InvestmentPlan";


function App() {
  const [userBase, setUserBase] = useState({});
  const [strategy, setStrategy] = useState(() => {
  
  const savedStrategy = localStorage.getItem("strategy");
    return savedStrategy ? JSON.parse(savedStrategy) : {};
  });
  const [investmentPlan, setInvestmentPlan] = useState(() => {
    const savedPlan = localStorage.getItem("investmentPlan");
    return savedPlan ? JSON.parse(savedPlan) : {};
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [err, setErr] = useState(null);

  const [hasUpdated, setHasUpdated] = useState(false);  // Flag to track if update has already occurred

  useEffect(() => {
    const updateUserBase = async () => {
      if (hasUpdated) return; // Skip the update if already done

      try {
        const response = await fetch("http://127.0.0.1:5000/api/user_base", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userBase),
        });

        if (!response.ok) throw new Error("Failed to update user base.");

        // Assuming the server responds with the updated userBase
        const updatedUserBase = await response.json();

        // Set the updated userBase
        setUserBase(updatedUserBase);  // This will trigger re-render with the updated data
        setHasUpdated(true); // Mark as updated

      } catch (error) {
        console.error("Error updating user base:", error);
        setErr(error.message);
      }
    };

    if (Object.keys(userBase).length > 0 && !hasUpdated) {
      updateUserBase();
    }
  }, [userBase, hasUpdated]); // Runs when `userBase` changes, but only once due to `hasUpdated`

 
  useEffect(() => {
    console.log("UserBase changed:", userBase); // Debugging
  
  }, [userBase]);


  /** Save Strategy to localStorage */
  useEffect(() => {
    if (Object.keys(strategy).length > 0) {
      localStorage.setItem("strategy", JSON.stringify(strategy));
    }
  }, [strategy]);

  /** Save Investment Plan to localStorage */
  useEffect(() => {
    if (Object.keys(investmentPlan).length > 0) {
      localStorage.setItem("investmentPlan", JSON.stringify(investmentPlan));
    }
  }, [investmentPlan]);

  /** Fetch Latest User Base Data */
  const fetchLatestUserBase = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/user_base/last");
      if (!response.ok) throw new Error("Failed to fetch latest user base data.");
      const result = await response.json();
      setUserBase(result);
    } catch (error) {
      console.error("Error fetching user base:", error);
      setErr(error.message);
    }
  };

  /** Fetch Strategy from Server on First Load */
  const fetchStrategy = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/strategy");
      if (!response.ok) throw new Error("Failed to fetch strategy data.");
      const result = await response.json();
      setStrategy(result);
    } catch (error) {
      console.error("Error fetching strategy:", error);
      setErr(error.message);
    }
  };

  /** Polling for Processing State */
  useEffect(() => {
    const checkProcessingState = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/processing");
        if (!response.ok) throw new Error("Failed to fetch processing state.");
        const result = await response.json();
        setIsProcessing(result.processing);
      } catch (error) {
        console.error("Error checking processing state:", error);
        setErr(error.message);
      }
    };

    const interval = setInterval(checkProcessingState, 3000);
    checkProcessingState(); // Run immediately on mount

    return () => clearInterval(interval);
  }, []);

  /** Poll Latest Data Only When Processing */
  useEffect(() => {
    let interval;

    if (isProcessing) {
      interval = setInterval(fetchLatestUserBase, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    const updateStrategy = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(strategy),
        });

        if (!response.ok) {
          throw new Error("Failed to update strategy.");
        }
      } catch (error) {
        console.error("Error updating strategy:", error);
        setErr(error.message);
      }
    };

    if (Object.keys(strategy).length > 0) {
      updateStrategy();
    }
  }, [strategy]);

  /** Fetch all initial data on app load */
  useEffect(() => {
    const fetchData = async () => {
      await fetchLatestUserBase();
      await fetchStrategy();
    };
    fetchData();
  }, [isProcessing]);

  return (
    <div className="dashboard">
      <h1 className="text-3xl font-bold mb-4">User Base Simulation</h1>
      <UserBaseOverview userBase={userBase} setUserBase={setUserBase} setIsProcessing={setIsProcessing}/>
      <div className="settings-bar">
        <InvestmentPlan
          investmentPlan={investmentPlan}
          setInvestmentPlan={setInvestmentPlan}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          err={err}
          setErr={setErr}
        />
        <StrategySettings
          strategy={strategy}
          setStrategy={setStrategy}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          err={err}
          setErr={setErr}
        />
        <UserDistributionChart 
          userBase={userBase} 
          setUserBase={setUserBase} 
          isProcessing={isProcessing} 
          setHasUpdated={setHasUpdated} 
          strategy={strategy} 
        />
      </div>
      <div id="plots" className="plots">
        <div>
          <ActiveUserChart data={userBase.days} strategy={strategy} />
          <UserBaseChart data={userBase.days} />
          <RevenueChart data={userBase.days} />
        </div>
        <div>
          <OptimizeInvestmentPlan
            investmentPlan={investmentPlan}
            setInvestmentPlan={setInvestmentPlan}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            err={err}
            setErr={setErr}
            strategy={strategy}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

