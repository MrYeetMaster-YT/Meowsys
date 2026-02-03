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
const connectDevice = document.getElementById("connectDevice");
const cameraFeed = document.getElementById("cameraFeed");
const cameraMessage = document.getElementById("cameraMessage");
const cameraOverlay = document.querySelector(".camera-overlay");

let activeStream = null;

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

const setCameraMessage = (message, isLive = false) => {
  if (cameraMessage) {
    cameraMessage.textContent = message;
  }
  if (cameraOverlay) {
    cameraOverlay.classList.toggle("hidden", isLive);
  }
};

const stopCamera = () => {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }
};

const startCamera = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraMessage("Camera unavailable in this browser.");
    return;
  }

  try {
    stopCamera();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    activeStream = stream;
    if (cameraFeed) {
      cameraFeed.srcObject = stream;
    }
    setCameraMessage("Live feed active", true);
  } catch (error) {
    setCameraMessage("Camera blocked. Allow permission to go live.");
  }
};

launchButton?.addEventListener("click", () => toggleModal(true));
startNow?.addEventListener("click", () => toggleModal(true));
closeModal?.addEventListener("click", () => toggleModal(false));
connectDevice?.addEventListener("click", () => {
  toggleModal(false);
  startCamera();
});

sessionModal?.addEventListener("click", (event) => {
  if (event.target === sessionModal) {
    toggleModal(false);
  }
});

renderAttendance();
updateClock();
setInterval(updateClock, 1000);
setCameraMessage("Camera offline · Click “Start Attendance” to connect");

window.addEventListener("beforeunload", () => {
  stopCamera();
});
