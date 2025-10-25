// --- CONFIGURATION ---
const API_URL = "http://127.0.0.1:5000/predict";

// Constants for features that don't change
const CONSTANTS = {
    Staff_Count: 10,
    Average_Wait_Time: 17,
    Emergency_Load: "Yes"
};

// --- UTILITY FUNCTIONS ---
function getDayNames() {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return [
        days[today.getDay()],
        days[(today.getDay() + 1) % 7],
        days[(today.getDay() + 2) % 7]
    ];
}

function formatHour(hour) {
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}


// --- API CALL ---
async function predictSingleHour(dayOffset, hour, department) {
    const requestData = {
        Day_of_Week: getDayNames()[dayOffset],
        Hour: hour,
        Department: department,
        Staff_Count: CONSTANTS.Staff_Count,
        Average_Wait_Time: CONSTANTS.Average_Wait_Time,
        Emergency_Load: CONSTANTS.Emergency_Load
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        const result = await response.json();
        return { day: dayOffset, hour, level: result.classification_prediction };
    } catch (err) {
        console.error(`Error fetching prediction for ${department} at hour ${hour}:`, err);
        return { day: dayOffset, hour, level: null };
    }
}

// --- RENDERING Table ---
async function renderScheduleTable(selectedDepartment) {
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const todayStatus = document.getElementById('todayStatus');
    const recommendedTextElement = document.getElementById('recommendedTime');

    tableBody.innerHTML = '<tr><td colspan="4">Loading hourly schedule...</td></tr>';
    todayStatus.textContent = 'Fetching...';
    recommendedTextElement.textContent = 'Calculating...';

    // 3 days × 24 hours
    const predictionPromises = [];
    for (let day = 0; day < 3; day++) {
        for (let hour = 0; hour < 24; hour++) {
            predictionPromises.push(predictSingleHour(day, hour, selectedDepartment));
        }
    }

    const results = await Promise.all(predictionPromises);

    // Structure data for table
    const hourlyPredictions = {};
    for (let hour = 0; hour < 24; hour++) hourlyPredictions[hour] = [null, null, null];
    results.forEach(p => { if (p.level !== null) hourlyPredictions[p.hour][p.day] = p.level; });

    // Update table header
    const dayNames = getDayNames();
    tableHeader.innerHTML = `<th>Time</th><th>${dayNames[0]}</th><th>${dayNames[1]}</th><th>${dayNames[2]}</th>`;

    // Render table rows 
    tableBody.innerHTML = '';
    for (let hour = 0; hour < 24; hour++) {
        const row = tableBody.insertRow();
        row.insertCell().textContent = formatHour(hour);

        hourlyPredictions[hour].forEach((level, dayIndex) => {
            const cell = row.insertCell();
            if (level === null) {
                cell.textContent = 'N/A';
                return;
            }
            let label = '', className = '';
            switch(level){
                case 0: label='Low'; className='low'; break;
                case 1: label='Medium'; className='medium'; break;
                case 2: label='High'; className='high'; break;
            }
            cell.innerHTML = `<span class="circle ${className}" style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:5px;"></span>${label}`;
        });
    }

    // --- Today's Crowd Prediction (most common level today)
    const todayLevels = Object.values(hourlyPredictions).map(levels => levels[0]);
    const counts = {0:0,1:0,2:0};
    todayLevels.forEach(l => { if(l!==null) counts[l]++; });
    let majorityLevel = 0, maxCount = -1;
    [2,1,0].forEach(lvl => { if(counts[lvl] >= maxCount){ maxCount=counts[lvl]; majorityLevel=lvl; }});
    let statusText='', statusClass='';
    switch(majorityLevel){
        case 0: statusText='Mostly Low'; statusClass='low'; break;
        case 1: statusText='Mostly Medium'; statusClass='medium'; break;
        case 2: statusText='Mostly High'; statusClass='high'; break;
    }
    todayStatus.textContent = statusText;
    todayStatus.className = 'status px-3 py-1 rounded-lg shadow-md ' + statusClass;

    // --- Recommended Time (first Low hour today)
    let recommendedTime = null;
    for (let hour=0; hour<24; hour++){
        const level = hourlyPredictions[hour][0]; // today
        if(level===0 && hour>new Date().getHours()){
            recommendedTime = formatHour(hour);
            break;
        }
    }
    recommendedTextElement.textContent = recommendedTime 
        ? recommendedTime + ' (Low Crowd)' 
        : 'No Low crowd times remaining today, check tomorrow';
}

// --- INITIALIZE DASHBOARD ---
function initializeDashboard() {
    const departmentFilter = document.getElementById('departmentFilter');

    const runUpdates = () => renderScheduleTable(departmentFilter.value);

    runUpdates();
    departmentFilter.addEventListener('change', runUpdates);

    document.getElementById('bookBtn').addEventListener('click', () => {
        window.location.href = '/chatbot';
    });

}

document.addEventListener('DOMContentLoaded', initializeDashboard);
