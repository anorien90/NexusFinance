import React, { useState, useEffect } from 'react';
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";

function StrategySettings({
  strategy,
  setStrategy,
  isProcessing,
  setIsProcessing,
  err,
  setErr
}) {
  // Set default values if strategy is not yet loaded
  const [localStrategy, setLocalStrategy] = useState({
    cost_per_install: strategy?.cost_per_install || 2.0,
    extra_invest: strategy?.extra_invest || [1000, 100000],
    extra_invest_days: strategy?.extra_invest_days || [30, 300],
    initial_invest: strategy?.initial_invest || [10000, 50000],
    num_extra_invest: strategy?.num_extra_invest || [0, 24],
    num_reinvest: strategy?.num_reinvest || [0, 24],
    reinvest_days: strategy?.reinvest_days || [0, 300],
    reinvest_rate: strategy?.reinvest_rate || [0.2, 0.8],
    target_day: strategy?.target_day || 365,
    target_user: strategy?.target_user || 10000
  });
  const [showSchedule, setShowSchedule] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalStrategy((prevStrategy) => ({
      ...prevStrategy,
      [name]: Number(value), // Convert to number
    }));
  };
  
  const handleSliderChange = (name, newValue) => {
    setLocalStrategy((prevStrategy) => ({
      ...prevStrategy,
      [name]: newValue, // Update array values
    }));
  };
  // Handle saving strategy changes
  const handleSaveChanges = () => {
    setStrategy(localStrategy);
  };
  
  const toggleScheduleVisibility = () => {
    setShowSchedule(!showSchedule);
  };

  return (
    <div className="strategy-settings">
      <div className="strategy-head">
        <h2 className="text-2xl font-bold mb-4">InvestmentStrategy</h2>
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
        <table className="strategy-inputs">
          <tbody>
            {/* Cost per Install */}
            <tr>
              <td>             
                <button
                  onClick={handleSaveChanges}
                  disabled={isProcessing}
                  className="save-changes-btn px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save Changes
                </button>
              </td>
              <td>
                <p>Cost per Install:</p>
                <TextField
                  type="number"
                  name="cost_per_install"
                  value={localStrategy.cost_per_install}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  size="small"
                />
              </td>
              <td>
                <p>Target Day:</p>
                <TextField
                  type="number"
                  name="target_day"
                  value={localStrategy.target_day}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  size="small"
                />
              </td>
              <td>
                <p>Target Users:</p>
                <TextField
                  type="number"
                  name="target_user"
                  value={localStrategy.target_user}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Initial Investment */}
            <tr>
              <td>Initial Investment:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.initial_invest[0]}
                  onChange={(e) =>
                    handleSliderChange("initial_invest", [
                      Number(e.target.value),
                      localStrategy.initial_invest[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.initial_invest}
                  onChange={(e, newValue) => handleSliderChange("initial_invest", newValue)}
                  valueLabelDisplay="auto"
                  min={10000}
                  max={200000}
                  step={5000}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.initial_invest[1]}
                  onChange={(e) =>
                    handleSliderChange("initial_invest", [
                      localStrategy.initial_invest[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Extra Investment */}
            <tr>
              <td>Extra Investment:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.extra_invest[0]}
                  onChange={(e) =>
                    handleSliderChange("extra_invest", [
                      Number(e.target.value),
                      localStrategy.extra_invest[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.extra_invest}
                  onChange={(e, newValue) => handleSliderChange("extra_invest", newValue)}
                  valueLabelDisplay="auto"
                  min={500}
                  max={200000}
                  step={500}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.extra_invest[1]}
                  onChange={(e) =>
                    handleSliderChange("extra_invest", [
                      localStrategy.extra_invest[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Extra Investment Days */}
            <tr>
              <td>Extra Investments:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.num_extra_invest[0]}
                  onChange={(e) =>
                    handleSliderChange("num_extra_invest", [
                      Number(e.target.value),
                      localStrategy.num_extra_invest[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.num_extra_invest}
                  onChange={(e, newValue) => handleSliderChange("num_extra_invest", newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={24}                   
                  step={1}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.num_extra_invest[1]}
                  onChange={(e) =>
                    handleSliderChange("num_extra_invest", [
                      localStrategy.num_extra_invest[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Extra Investment Days */}
            <tr>
              <td>Investment Days:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.extra_invest_days[0]}
                  onChange={(e) =>
                    handleSliderChange("extra_invest_days", [
                      Number(e.target.value),
                      localStrategy.extra_invest_days[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.extra_invest_days}
                  onChange={(e, newValue) => handleSliderChange("extra_invest_days", newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={365}
                  step={1}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.extra_invest_days[1]}
                  onChange={(e) =>
                    handleSliderChange("extra_invest_days", [
                      localStrategy.extra_invest_days[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Reinvestment Rate */}
            <tr>
              <td>Reinvestment Rate:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.reinvest_rate[0]}
                  onChange={(e) =>
                    handleSliderChange("reinvest_rate", [
                      Number(e.target.value),
                      localStrategy.reinvest_rate[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.reinvest_rate}
                  onChange={(e, newValue) => handleSliderChange("reinvest_rate", newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1}
                  step={0.1}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.reinvest_rate[1]}
                  onChange={(e) =>
                    handleSliderChange("reinvest_rate", [
                      localStrategy.reinvest_rate[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Reinvestments */}
            <tr>
              <td>Reinvestments:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.num_reinvest[0]}
                  onChange={(e) =>
                    handleSliderChange("num_reinvest", [
                      Number(e.target.value),
                      localStrategy.num_reinvest[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.num_reinvest}
                  onChange={(e, newValue) => handleSliderChange("num_reinvest", newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={365}
                  step={1}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.num_reinvest[1]}
                  onChange={(e) =>
                    handleSliderChange("num_reinvest", [
                      localStrategy.num_reinvest[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>

            {/* Reinvestment Days */}
            <tr>
              <td>Reinvestment Days:</td>
              <td>
                <TextField
                  type="number"
                  value={localStrategy.reinvest_days[0]}
                  onChange={(e) =>
                    handleSliderChange("reinvest_days", [
                      Number(e.target.value),
                      localStrategy.reinvest_days[1],
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
                <Slider
                  className="strategy-settings-slider"
                  value={localStrategy.reinvest_days}
                  onChange={(e, newValue) => handleSliderChange("reinvest_days", newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={365}
                  step={1}
                  disabled={isProcessing}
                />
                <TextField
                  type="number"
                  value={localStrategy.reinvest_days[1]}
                  onChange={(e) =>
                    handleSliderChange("reinvest_days", [
                      localStrategy.reinvest_days[0],
                      Number(e.target.value),
                    ])
                  }
                  disabled={isProcessing}
                  size="small"
                />
              </td>
            </tr>
          </tbody>
        </table>
      )}

    </div>
  );
}

export default StrategySettings;

