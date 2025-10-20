// بيانات مؤقتة (mock data) — يمكن استبدالها لاحقًا ببيانات من API أو model
const data = [
  { department: "Emergency", time: "09:00–10:00", status: "High", recommendation: "Increase staff" },
  { department: "Pediatrics", time: "10:00–11:00", status: "Medium", recommendation: "Current staff is sufficient" },
  { department: "Eye", time: "12:00–13:00", status: "Low", recommendation: "No staff adjustment needed" }
];

function loadTable() {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.department}</td>
      <td>${item.time}</td>
      <td><span class="status ${item.status.toLowerCase()}">● ${item.status}</span></td>
      <td>${item.recommendation}</td>
    `;
    tbody.appendChild(row);
  });

  // تحديث التاريخ
  document.getElementById("update-info").innerHTML =
    `Last update: ${new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}<br>
     Data based on prediction model v1.0`;
}

window.onload = loadTable;
