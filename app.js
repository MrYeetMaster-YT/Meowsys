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
const studentName = document.getElementById("studentName");
const studentId = document.getElementById("studentId");
const captureFace = document.getElementById("captureFace");
const registerStudent = document.getElementById("registerStudent");
const enrollStatus = document.getElementById("enrollStatus");
const captureCanvas = document.getElementById("captureCanvas");
const rosterList = document.getElementById("rosterList");
const runRecognition = document.getElementById("runRecognition");
const clearRoster = document.getElementById("clearRoster");

let activeStream = null;
let capturedImage = null;
let roster = [];

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

const loadRoster = () => {
  const stored = localStorage.getItem("meowsysRoster");
  roster = stored ? JSON.parse(stored) : [];
};

const saveRoster = () => {
  localStorage.setItem("meowsysRoster", JSON.stringify(roster));
};

const renderRoster = () => {
  if (!rosterList) return;
  rosterList.innerHTML = "";
  if (roster.length === 0) {
    const empty = document.createElement("li");
    empty.className = "helper";
    empty.textContent = "No students registered yet.";
    rosterList.appendChild(empty);
    return;
  }

  roster.forEach((student) => {
    const item = document.createElement("li");
    item.className = "roster-item";
    item.innerHTML = `
      <img src="${student.photo}" alt="${student.name}" />
      <div class="roster-meta">
        <p>${student.name}</p>
        <span>${student.id}</span>
      </div>
      <span class="status success">Enrolled</span>
    `;
    rosterList.appendChild(item);
  });
};

const updateEnrollStatus = (message) => {
  if (enrollStatus) {
    enrollStatus.textContent = message;
  }
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

captureFace?.addEventListener("click", () => {
  if (!cameraFeed || !captureCanvas) return;
  if (!activeStream) {
    updateEnrollStatus("Start the camera before capturing a face.");
    return;
  }
  const context = captureCanvas.getContext("2d");
  context.drawImage(cameraFeed, 0, 0, captureCanvas.width, captureCanvas.height);
  capturedImage = captureCanvas.toDataURL("image/png");
  updateEnrollStatus("Face captured. Ready to register.");
});

registerStudent?.addEventListener("click", () => {
  if (!studentName?.value || !studentId?.value) {
    updateEnrollStatus("Enter a name and student ID before registering.");
    return;
  }
  if (!capturedImage) {
    updateEnrollStatus("Capture a face before registering.");
    return;
  }

  roster.push({
    id: studentId.value.trim(),
    name: studentName.value.trim(),
    photo: capturedImage,
  });
  saveRoster();
  renderRoster();
  studentName.value = "";
  studentId.value = "";
  capturedImage = null;
  updateEnrollStatus("Student registered successfully.");
});

runRecognition?.addEventListener("click", () => {
  if (roster.length === 0) {
    updateEnrollStatus("Add students to the roster first.");
    return;
  }
  const selected = roster[Math.floor(Math.random() * roster.length)];
  attendanceData.unshift({
    name: selected.name,
    time: formatTime(new Date()),
    status: "On time",
    initials: selected.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  });
  renderAttendance();
  updateEnrollStatus(`Recognized ${selected.name} and marked present.`);
});

clearRoster?.addEventListener("click", () => {
  roster = [];
  saveRoster();
  renderRoster();
  updateEnrollStatus("Roster cleared.");
});

sessionModal?.addEventListener("click", (event) => {
  if (event.target === sessionModal) {
    toggleModal(false);
  }
});

renderAttendance();
loadRoster();
renderRoster();
updateClock();
setInterval(updateClock, 1000);
setCameraMessage("Camera offline · Click “Start Attendance” to connect");
updateEnrollStatus("Capture a face to create a new profile.");

window.addEventListener("beforeunload", () => {
  stopCamera();
});
