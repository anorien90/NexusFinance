import React, { useEffect, useState } from "react";

const UserBaseOverview = ({ userBase, setUserBase, setIsProcessing }) => {
  const [overviewData, setOverviewData] = useState({
    day: 0,
    active_user_count: 0,
    total_cost: 0,
    total_installed: 0,
    total_revenue: 0,
    conversion_rate: 0,
    mean_conversion_rate: 0,
    lifelong_user_count: 0,
    lifelong_conversion_rate: 0,
    total_reinvest: 0,
  });

  const [error, setError] = useState(null); // Added error state

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number).replace(/,/g, ' '); // Replaces commas with spaces
  };

  useEffect(() => {
    const updateOverviewData = () => {
      if (!userBase) return; // If no data, don't process

      try {
        // Destructuring simulationData with fallback values to prevent undefined errors
        const {
          day = 0, // Default value if undefined
          total_cost = 0, // Default value if undefined
          total_installed = 0, // Default value if undefined
          total_revenue = 0, // Default value if undefined
          conversion_rate = 0, // Default value if undefined
          mean_conversion_rate = 0, // Default value if undefined
          lifelong_conversion_rate = 0, // Default value if undefined
          total_reinvest = 0, // Default value if undefined
          active_user = [], // Default to empty array if undefined
          lifelong_user = [], // Default to empty array if undefined
        } = userBase;

        setOverviewData({
          day,
          total_cost,
          total_installed,
          total_revenue,
          conversion_rate,
          mean_conversion_rate,
          lifelong_conversion_rate,
          total_reinvest,
          active_user_count: active_user.length,
          lifelong_user_count: lifelong_user.length,
        });
      } catch (err) {
        console.error("Error updating overview data:", err);
        setError("An error occurred while updating the overview data.");
      }
    };
    updateOverviewData();
  }, [userBase]); // Re-run whenever simulationData changes

  return (
    <div className="overview">
      <div className="overview-item">
        <h3 className="overview-key">Days</h3>
        <p className="overview-value" id="day-value">{formatNumber(overviewData.day)}</p>
      </div>
      <div className="overview-item">
        <h3 className="overview-key">Total Installed</h3>
        <p className="overview-value" id="total-installed-value">{formatNumber(overviewData.total_installed)}</p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Active User</h3>
        <p className="overview-value" id="active-user-value">{formatNumber(overviewData.active_user_count)}</p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Conversion Rate</h3>
        <p className="overview-value" id="conversion-rate-value">
          {formatNumber(overviewData.conversion_rate * 100)}%
        </p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Mean Conversion Rate</h3>
        <p className="overview-value" id="mean-conversion-rate-value">
          {formatNumber(overviewData.mean_conversion_rate * 100)}%
        </p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Lifelong Conversion Rate</h3>
        <p className="overview-value" id="lifelong-conversion-rate-value">
          {formatNumber(overviewData.lifelong_conversion_rate * 100)}%
        </p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Lifelong User</h3>
        <p className="overview-value" id="lifelong-user-value">{formatNumber(overviewData.lifelong_user_count)}</p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Total Revenue</h3>
        <p className="overview-value" id="total-revenue-value">${formatNumber(overviewData.total_revenue)}</p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key">Total Reinvestment</h3>
        <p className="overview-value" id="total-reinvest-value">${formatNumber(overviewData.total_reinvest)}</p>
      </div>

      <div className="overview-item">
        <h3 className="overview-key" id="total-cost-key">Total Cost</h3>
        <p className="overview-value" id="total-cost-value">${formatNumber(overviewData.total_cost)}</p>
      </div>
    </div>
  );
};

export default UserBaseOverview;

