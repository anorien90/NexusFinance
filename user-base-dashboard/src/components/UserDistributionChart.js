import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const UserDistributionChart = ({ userBase, setUserBase, isProcessing, setHasUpdated }) => {
  const [userTypes, setUserTypes] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [changes, setChanges] = useState(false);

  const toggleScheduleVisibility = () => {
    setShowSchedule(!showSchedule);
  };

  useEffect(() => {
  const fetchUserTypes = async () => {
    const response = await fetch("http://127.0.0.1:5000/api/user_base/types");
    const data = await response.json();

    // Update the max_days_of_activity values
    const updatedUserTypes = data.types.map((type) => ({
      ...type,
      max_days_of_activity: type.max_days_of_activity === null ? Infinity : type.max_days_of_activity,
    }));

    setUserTypes(updatedUserTypes);
  };

  if (userTypes.length === 0) {
    fetchUserTypes();
  } else {
    setUserBase((prevState) => ({
      ...prevState,
      types: userTypes,
    }));
  }
  }, [setUserBase]);

  const lifelongUsersData = userTypes.filter((usr) => usr.max_days_of_activity === "Infinity");
  const temporaryUsersData = userTypes.filter((usr) => usr.max_days_of_activity !== "Infinity");

  const lifelongData = lifelongUsersData.map((usr) => ({
    conversion_rate: usr.conversion_rate,
    daily_hours: usr.daily_hours,
    max_days_of_activity: 365,
  }));

  const temporaryData = temporaryUsersData.map((usr) => ({
    conversion_rate: usr.conversion_rate,
    daily_hours: usr.daily_hours,
    max_days_of_activity: usr.max_days_of_activity || 50,
  }));

  const handleInputChange = (index, field, value) => {
    const updatedTypes = [...userTypes];
    updatedTypes[index][field] = field === "max_days_of_activity" && (value === Infinity || value === null)
      ? Infinity
      : value;
    setUserTypes(updatedTypes);
    setChanges(true);
  };

  const addNewType = () => {
    const newType = { conversion_rate: 0.01, daily_hours: 0.01, max_days_of_activity: 50 };
    setUserTypes((prevTypes) => [...prevTypes, newType]);
    setChanges(true);
  };

  const deleteType = (index) => {
    const updatedTypes = userTypes.filter((_, i) => i !== index);
    setUserTypes(updatedTypes);
    setChanges(true);
  };

  // Automatically update userBase state, which will trigger the POST request
  const updateUserBase = async (updatedTypes) => {
    setUserBase((prevState) => ({
      ...prevState,
      types: updatedTypes,
    }));
    setChanges(false);
  };

  const handleFormSubmit = async () => {
    setUserBase((prevState) => ({
    ...prevState,
    types: userTypes.map((type) => ({
      ...type,
      max_days_of_activity: type.max_days_of_activity === Infinity ? null : type.max_days_of_activity,
      })),
    }));
  
    setChanges(false);
    setShowSchedule(false);
    setHasUpdated(false);
  };
  //
   // Download user types as JSON
  const downloadUserTypes = () => {
    const dataStr = JSON.stringify(
      userTypes.map((type) => ({
        ...type,
        max_days_of_activity: type.max_days_of_activity === Infinity ? null : type.max_days_of_activity,
      })),
      null,
      2
    );
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = "user_types.json";
    downloadLink.click();
  };

  // Load user types from JSON file
  const loadUserTypes = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedUserTypes = JSON.parse(e.target.result).map((type) => ({
          ...type,
          max_days_of_activity: type.max_days_of_activity === null ? "Infinity" : type.max_days_of_activity,
        }));
        if (Array.isArray(loadedUserTypes)) {
          setUserTypes(loadedUserTypes);
        } else {
          alert("Invalid JSON format. Please upload a valid user types JSON file.");
        }
      } catch (error) {
        console.error("Error loading user types:", error);
        alert("Error loading user types. Please ensure the file is a valid JSON.");
      }
    };
    reader.readAsText(file);
    setChanges(true);
  };

  return (
    <div className="user-distribution-container">
      <div className="user-actions">
        <h2>UserDistribution</h2>
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
        {showSchedule && (
        <div>
        <button type="button" onClick={handleFormSubmit} disabled={!changes}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
        </button>
        <button onClick={downloadUserTypes}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
        </button>
        <input type="file" accept=".json" onChange={loadUserTypes} />
        </div>)}
      </div>

    <div className="user-distribution-plot">
    <ResponsiveContainer width="100%" height={200} style={{paddingTop: "0px", marginTop: "0px" }}>
        <ScatterChart style={{paddingTop: "0px", marginTop: "0px" }}>
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="conversion_rate" 
            name="Conversion Rate" 
            domain={[0.1, (dataMax) => Math.ceil(dataMax * 1.1)]} 
            label={{ value: "Conversion Rate", position: "insideBottomRight", offset: 10}} 
          />
          <YAxis 
            type="number" 
            dataKey="daily_hours" 
            domain={[0.5, (dataMax) => Math.ceil(dataMax * 1.1)]} 
            label={{ value: "Hours per Day", position: "insideBottomLeft", offset: 15, angle: -90}}
          />

          <ZAxis type="number" dataKey="max_days_of_activity" range={[0, 365]} scale="log" domain={[.5, "dataMax"]} name="Max Days of Activity" />
          <Tooltip cursor={{ strokeDasharray: "5 5" }} />
          <Legend />
          <Scatter name="Lifelong Users" data={lifelongData} fill="green" shape="circle" />
          <Scatter name="Temporary Users" data={temporaryData} fill="blue" shape="circle" />
        </ScatterChart>
        </ResponsiveContainer>
      </div>
      {showSchedule && (
      <form className="user-edit-form" onSubmit={handleFormSubmit} style={{ marginTop: "20px" }}>
        {userTypes.map((user, index) => (
          <div className="user-type" key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
              <div>
                <table className="user-rates">
                   <thead>
                      <tr>
                        <th>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            height="24px" 
                            viewBox="0 -960 960 960" 
                            width="24px" 
                            fill={user.max_days_of_activity === "Infinity" ? "green" : "blue"} 
                          >
                            <path 
                              d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/>
                          </svg>
                       </th>
                        <th>
                          <div className="tooltip">
                          <button 
                            type="button" 
                            onClick={() => deleteType(index)}>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              height="24px" 
                              viewBox="0 -960 960 960" 
                              width="24px" 
                              fill="red"
                            >
                            <path d="M648-542v-60h232v60H648Zm-288 61q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42ZM40-160v-94q0-35 17.5-63.5T108-360q75-33 133.34-46.5t118.5-13.5Q420-420 478-406.5T611-360q33 15 51 43t18 63v94H40Zm60-60h520v-34q0-16-9-30.5T587-306q-71-33-120-43.5T360-360q-58 0-107.5 10.5T132-306q-15 7-23.5 21.5T100-254v34Zm260-321q39 0 64.5-25.5T450-631q0-39-25.5-64.5T360-721q-39 0-64.5 25.5T270-631q0 39 25.5 64.5T360-541Zm0-90Zm0 411Z"/>
                            </svg>
                          </button>
                          <span className="tooltip-text"> Delete a <b>UserType</b> from the current <b>UserBase</b></span>  
                        </div>
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                      <div className="tooltip">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          height="24px" 
                          viewBox="0 -960 960 960" 
                          width="24px" 
                          fill="#000000">
                          <path 
                            d="M474-486q26-32 38.5-66t12.5-79q0-45-12.5-79T474-776q76-17 133.5 23T665-631q0 82-57.5 122T474-486Zm216 326v-94q0-51-26-95t-90-74q173 22 236.5 64T874-254v94H690Zm110-289v-100H700v-60h100v-100h60v100h100v60H860v100h-60Zm-485-32q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42ZM0-160v-94q0-35 18.5-63.5T68-360q72-32 128.5-46T315-420q62 0 118 14t128 46q31 14 50 42.5t19 63.5v94H0Zm315-381q39 0 64.5-25.5T405-631q0-39-25.5-64.5T315-721q-39 0-64.5 25.5T225-631q0 39 25.5 64.5T315-541ZM60-220h510v-34q0-16-8-30t-25-22q-69-32-117-43t-105-11q-57 0-104.5 11T92-306q-15 7-23.5 21.5T60-254v34Zm255-411Zm0 411Z"/>
                        </svg>
                        <span className="tooltip-text"><b>Conversion Rate</b> of the <b>UserType</b> in <b>%</b></span>
                      </div>
                      </td>
                      <td>
                        <input 
                          type="range" 
                          min="0"
                          max="1"
                          step=".05"
                          value={user.conversion_rate} 
                          onChange={(e) => handleInputChange(index, "conversion_rate", parseFloat(e.target.value))} 
                        />
                        <input 
                          type="number" 
                          step=".01"
                          value={user.conversion_rate} 
                          onChange={(e) => handleInputChange(index, "conversion_rate", parseFloat(e.target.value))} 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="tooltip">
                          <svg 
                           xmlns="http://www.w3.org/2000/svg" 
                           height="24px" 
                           viewBox="0 -960 960 960" 
                           width="24px" 
                           fill="#000000"
                          >
                          <path 
                            d="M200-640h560v-80H200v80Zm0 0v-80 80Zm0 560q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v227q-19-9-39-15t-41-9v-43H200v400h252q7 22 16.5 42T491-80H200Zm520 40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm67-105 28-28-75-75v-112h-40v128l87 87Z"/>
                          </svg>
                      <span className="tooltip-text">Average <b>Daily Hours</b> of Usage for the <b>UserType</b></span> 
                      </div>
                      </td>
                      <td className="user-rates-input">
                        <input 
                          type="range" 
                          min="0" 
                          max="24" 
                          step=".05" 
                          value={user.daily_hours} 
                          onChange={(e) => handleInputChange(index, "daily_hours", parseFloat(e.target.value))} 
                        />
                        <input 
                          className="daily-hours-number"
                          type="number" 
                          min="0"
                          max="24"
                          step="0.01"
                          value={user.daily_hours} 
                          onChange={(e) => handleInputChange(index, "daily_hours", parseFloat(e.target.value))} 
                        />
                        <label className="user-rates-unit">h/d</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="tooltip">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            height="24px" 
                            viewBox="0 -960 960 960" 
                            width="24px" 
                            fill="#000000">
                              <path 
                              d="M320-400q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm160 0q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm160 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
                          </svg>
                          <span className="tooltip-text">Maximum Days of Activity of the UserType. Lifelong User have 'Infinity' Days of Usage</span>
                        </div>
                      </td>
                      <td className="days-of-activity-inputs">
                        <input 
                          type="range" 
                          min="1" 
                          max="365" 
                          step="1" 
                          value={user.max_days_of_activity === "Infinity" ? 365 : user.max_days_of_activity} 
                          onChange={(e) => handleInputChange(index, "max_days_of_activity", parseInt(e.target.value))} 
                          disabled={user.max_days_of_activity === Infinity} 
                        />
                        <input 
                          type="number" 
                          min="1" 
                          max="365" 
                          step="1" 
                          value={user.max_days_of_activity === "Infinity" ? 365 : user.max_days_of_activity} 
                          onChange={(e) => handleInputChange(index, "max_days_of_activity", parseInt(e.target.value))} 
                          disabled={user.max_days_of_activity === "Infinity"} 
                        />
                        <svg 
                          className="inf-input"
                          xmlns="http://www.w3.org/2000/svg" 
                          height="16px" 
                          viewBox="0 -960 960 960" 
                          width="16px" 
                          fill="#000000"> 
                          <path 
                            d="M216.6-264Q126-264 63-326.77t-63-153Q0-570 63-633q63.01-63 153.58-63 36.42 0 69.92 12.5T347-647l79 71-54 48-72-65q-17-15-37.89-23t-43.87-8q-60.59 0-103.41 42.09Q72-539.82 72-479.91t42.83 102.41Q157.65-335 218.24-335q22.98 0 43.87-8Q283-351 300-366l313-281q27-23 60.48-36 33.47-13 69.9-13 90.59 0 153.6 62.95Q960-570.1 960-480q0 91-63.42 153.5T742-264q-36.3 0-69.65-12.5Q639-289 612-313l-80-72 56-47 72 65q17 15 37.89 23t43.87 8q60.59 0 103.41-42.09 42.83-42.09 42.83-102T845.17-582.5Q802.35-625 741.76-625q-22.98 0-43.87 8Q677-609 660-594L347.24-313.08Q320-289 286.52-276.5 253.04-264 216.6-264Z"/>
                        </svg>
                        <input 
                          type="checkbox" 
                          checked={user.max_days_of_activity === "Infinity"} 
                          onChange={(e) => handleInputChange(index, "max_days_of_activity", e.target.checked ? "Infinity" : 50)} 
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>
        ))}
     <div className="new-user">
     <button type="button" onClick={addNewType}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          height="2rem" 
          viewBox="0 -960 960 960" 
          width="2rem" 
          fill="#000000">
        <path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-360-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/></svg>
     </button>
    </div>
     </form>
      )}
    </div>
  );
};

export default UserDistributionChart;

