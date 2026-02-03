const attendanceData = [
  { name: "Zara Mitchell", time: "08:29 AM", status: "On time", initials: "ZM" },
  { name: "Kiran Patel", time: "08:31 AM", status: "On time", initials: "KP" },
  { name: "Noah Santos", time: "08:34 AM", status: "On time", initials: "NS" },
  { name: "Lina Rodriguez", time: "08:36 AM", status: "Late", initials: "LR" },
  { name: "Aria Chen", time: "08:39 AM", status: "On time", initials: "AC" },
];

const attendanceList = document.getElementById("attendanceList");
const liveTime = document.getElementById("liveTime");
const sessionModal = document.getElementById("sessionModal");
const launchButton = document.getElementById("launchButton");
const startNow = document.getElementById("startNow");
const closeModal = document.getElementById("closeModal");

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const renderAttendance = () => {
  attendanceList.innerHTML = "";
  attendanceData.forEach((student) => {
    const item = document.createElement("li");
    item.className = "attendance-item";

    item.innerHTML = `
      <div class="student">
        <div class="avatar">${student.initials}</div>
        <div>
          <p>${student.name}</p>
          <span>${student.time}</span>
        </div>
      </div>
      <span class="status ${student.status === "Late" ? "warning" : "success"}">
        ${student.status}
      </span>
    `;

    attendanceList.appendChild(item);
  });
};

const updateClock = () => {
  if (liveTime) {
    liveTime.textContent = formatTime(new Date());
  }
};

const toggleModal = (show) => {
  sessionModal.classList.toggle("show", show);
  sessionModal.setAttribute("aria-hidden", (!show).toString());
};

launchButton?.addEventListener("click", () => toggleModal(true));
startNow?.addEventListener("click", () => toggleModal(true));
closeModal?.addEventListener("click", () => toggleModal(false));

sessionModal?.addEventListener("click", (event) => {
  if (event.target === sessionModal) {
    toggleModal(false);
  }
});

renderAttendance();
updateClock();
setInterval(updateClock, 1000);
