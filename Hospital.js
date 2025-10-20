const API_URL = "http://127.0.0.1:5000/predict";

// Constants
const CONSTANTS = {
  Staff_Count: 10,
  Average_Wait_Time: 17,
  Emergency_Load: "Yes",
};

// Departments (5 rows)
const DEPARTMENTS = ["Emergency", "Cardiology", "Pediatrics", "Radiology", "Surgery"];

// Utility functions
function getTodayName() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[new Date().getDay()];
}

function getTomorrowName() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[(new Date().getDay() + 1) % 7];
}

function levelToLabel(level) {
  switch (level) {
    case 0: return { label: "Low", class: "low" };
    case 1: return { label: "Medium", class: "medium" };
    case 2: return { label: "High", class: "high" };
    default: return { label: "N/A", class: "" };
  }
}

function staffingRecommendation(level) {
  switch (level) {
    case 0: return "Maintain current staff.";
    case 1: return "Consider small increase.";
    case 2: return "Increase staff for next cycle.";
    default: return "No data available.";
  }
}

// API request for one hour
async function predictSingleHour(hour, department, dayName) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Day_of_Week: dayName,
        Hour: hour,
        Department: department,
        ...CONSTANTS,
      }),
    });

    const data = await response.json();
    return typeof data.prediction === "number" ? data.prediction : null;
  } catch (error) {
    console.error("Prediction error:", error);
    return null;
  }
}

// Find majority crowd level
function majorityLevel(levels) {
  const counts = { 0: 0, 1: 0, 2: 0 };
  levels.forEach((l) => { if (l !== null) counts[l]++; });

  let maxCount = -1, selected = 0;
  [2, 1, 0].forEach((lvl) => {
    if (counts[lvl] >= maxCount) {
      maxCount = counts[lvl];
      selected = lvl;
    }
  });
  return selected;
}

// Render dashboard
async function renderHospitalTable() {
  const tableBody = document.querySelector("#data-table tbody");
  const updateInfo = document.getElementById("update-info");
  tableBody.innerHTML = "<tr><td colspan='4'>Loading predictions...</td></tr>";

  const now = new Date();
  const currentHour = now.getHours();
  const todayName = getTodayName();
  const tomorrowName = getTomorrowName();
  const updateTime = now.toLocaleTimeString();

  // Determine which 12-hour cycles to show
  const showingEvening = currentHour >= 12;
  const firstPeriod = showingEvening
    ? { label: `(12 PM–11 PM) - ${todayName}`, hours: [...Array(12).keys()].map(h => h + 12), dayName: todayName }
    : { label: `(12 AM–11 AM) - ${todayName}`, hours: [...Array(12).keys()], dayName: todayName };

  const secondPeriod = showingEvening
    ? { label: `(12 AM–11 AM) - ${tomorrowName}`, hours: [...Array(12).keys()], dayName: tomorrowName }
    : { label: `(12 PM–11 PM) - ${todayName}`, hours: [...Array(12).keys()].map(h => h + 12), dayName: todayName };

  const results = [];

  // For each department
  for (const dept of DEPARTMENTS) {
    // Predict all hours for both periods
    const allPromises = [];
    firstPeriod.hours.forEach(h => allPromises.push(predictSingleHour(h, dept, firstPeriod.dayName)));
    secondPeriod.hours.forEach(h => allPromises.push(predictSingleHour(h, dept, secondPeriod.dayName)));

    const predictions = await Promise.all(allPromises);

    const firstLevels = predictions.slice(0, 12);
    const secondLevels = predictions.slice(12, 24);

    const firstMajority = majorityLevel(firstLevels);
    const secondMajority = majorityLevel(secondLevels);

    // Overall status: which period is more crowded
    const overall = majorityLevel([firstMajority, secondMajority]);

    results.push({
      department: dept,
      periods: [
        { name: firstPeriod.label, level: firstMajority },
        { name: secondPeriod.label, level: secondMajority },
      ],
      overall,
    });
  }

  // Render table
  tableBody.innerHTML = "";
  results.forEach((r) => {
    const row = tableBody.insertRow();

    // Department
    row.insertCell().textContent = r.department;

    // Periods
    const timeCell = row.insertCell();
    timeCell.innerHTML = `
      <div>
        <strong>${r.periods[0].name}</strong> – 
        <span class="${levelToLabel(r.periods[0].level).class}">
          ${levelToLabel(r.periods[0].level).label}
        </span><br>
        <strong>${r.periods[1].name}</strong> – 
        <span class="${levelToLabel(r.periods[1].level).class}">
          ${levelToLabel(r.periods[1].level).label}
        </span>
      </div>
    `;

    // Overall Status
    const statusCell = row.insertCell();
    const { label, class: cls } = levelToLabel(r.overall);
    statusCell.innerHTML = `<span class="${cls}">${label}</span>`;

    // Recommendation
    const recCell = row.insertCell();
    recCell.textContent = staffingRecommendation(r.overall);
  });

  updateInfo.textContent = `Last updated: ${todayName}, ${updateTime}`;
}

// Initialize
document.addEventListener("DOMContentLoaded", renderHospitalTable);
