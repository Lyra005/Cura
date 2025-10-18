// مثال لقيمة قادمة من الموديل أو الـ backend
let crowdLevel = "high";

// نحط القيمة داخل العنصر
const statusEl = document.getElementById("todayStatus");
statusEl.textContent = crowdLevel;

// (اختياري) نضيف له كلاس لتغيير اللون حسب المستوى
statusEl.className = crowdLevel.toLowerCase();



const times = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"];
const departments = ["cardiology", "pediatrics", "neurology"];

// Function to get next 3 days
function getNext3Days() {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const formatted = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
        dates.push(formatted);
    }
    return dates;
}

// Example booking data per department
const bookingsData = {
    cardiology: {},
    pediatrics: {},
    neurology: {}
};

const levels = ["High", "Medium", "Low"];
const dates = getNext3Days();

// Fill example data randomly
departments.forEach(dep => {
    bookingsData[dep] = {};
    dates.forEach(date => {
        bookingsData[dep][date] = times.map(() => {
            const level = levels[Math.floor(Math.random() * levels.length)];
            return { level }; // يمكن إضافة patient name لاحقًا
        });
    });
});

// Function to build table
function buildTable(department) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    tableHeader.innerHTML = "<th>Time</th>"; // reset header
    tableBody.innerHTML = ""; // reset body

    // Header
    dates.forEach(date => {
        const th = document.createElement('th');
        th.textContent = date;
        tableHeader.appendChild(th);
    });

    // Body
    times.forEach((time, rowIndex) => {
        const tr = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        tr.appendChild(timeCell);

        dates.forEach(date => {
            const td = document.createElement('td');
            const booking = bookingsData[department][date][rowIndex];

            const indicator = document.createElement('span');
            indicator.classList.add('indicator');
            if (booking.level === "High") indicator.classList.add('high');
            if (booking.level === "Medium") indicator.classList.add('medium');
            if (booking.level === "Low") indicator.classList.add('low');

            td.appendChild(indicator);
            td.appendChild(document.createTextNode(booking.level));

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}

// Initial table
buildTable("cardiology");

// Filter change
document.getElementById('departmentFilter').addEventListener('change', (e) => {
    const dept = e.target.value;
    if (dept === "all") buildTable("cardiology"); // default or merge all later
    else buildTable(dept);
});








