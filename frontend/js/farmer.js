document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  const preview = document.getElementById("preview");
  const captureBtn = document.getElementById("captureBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");
  const coordsEl = document.getElementById("coords");
  const timestampEl = document.getElementById("timestamp");
  const formSection = document.getElementById("formSection");
  const afterSubmit = document.getElementById("afterSubmit");
  const submittedDetails = document.getElementById("submittedDetails");
  const addAnother = document.getElementById("addAnother");
  const logoutTop = document.getElementById("logoutTop");

  let imageBase64 = null;
  let latitude = null;
  let longitude = null;
  let cameraStream = null;

  // ✅ Function to start camera
  async function startCamera() {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = cameraStream;
      video.style.display = "block";
      preview.style.display = "none";
    } catch (err) {
      showMessage("Camera access denied: " + err.message, "error");
    }
  }

  // ✅ Stop camera
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }

  // Start immediately
  startCamera();

  // ✅ Get location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude = pos.coords.latitude.toFixed(6);
        longitude = pos.coords.longitude.toFixed(6);
        coordsEl.textContent = `${latitude}, ${longitude}`;
      },
      () => {
        coordsEl.textContent = "Permission denied";
      }
    );
  }

  timestampEl.textContent = new Date().toLocaleString();

  // ✅ Capture photo
  captureBtn.onclick = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    imageBase64 = canvas.toDataURL("image/png");
    preview.src = imageBase64;
    preview.style.display = "block";
    video.style.display = "none";
    stopCamera();
  };

  // ✅ Upload image
  uploadBtn.onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imageBase64 = ev.target.result;
      preview.src = imageBase64;
      preview.style.display = "block";
      video.style.display = "none";
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // ✅ Submit to backend
  submitBtn.onclick = async () => {
  const farmerName = document.getElementById("farmerName").value.trim();
  const herbName = document.getElementById("herbName").value.trim();

  if (!farmerName || !herbName || !imageBase64) {
    showMessage("Please fill all fields and capture/upload photo", "error");
    return;
  }

  const payload = {
    farmerName,
    herbName,
    coordinates: `${latitude}, ${longitude}`,
    timestamp: timestampEl.textContent,
    image: imageBase64
  };

  // ✅ Allow UI to refresh before heavy upload
  showMessage("Submitting...", "success");
  await new Promise((resolve) => setTimeout(resolve, 100)); // <— tiny pause for paint

  try {
    console.log("🚀 Sending payload:", payload);
    const res = await fetch("http://localhost:5000/api/farmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Server error");

    // ✅ Now show message instantly
    showMessage("✅ Submitted successfully!", "success", 4000);

    // Replace card with summary
    formSection.style.display = "none";
    afterSubmit.style.display = "block";
    submittedDetails.innerHTML = `
      <p><b>Farmer:</b> ${data.entry.farmerName}</p>
      <p><b>Herb:</b> ${data.entry.herbName}</p>
      <p><b>ID:</b> ${data.entry.herbId}</p>
      <p><b>Coordinates:</b> ${data.entry.latitude}, ${data.entry.longitude}</p>
      <p><b>Timestamp:</b> ${data.entry.timestamp}</p>
      <img src="${data.entry.photoUrl}" style="width:100%; border-radius:10px; margin-top:10px;">
    `;
  } catch (err) {
    console.error("❌ Error submitting:", err);
    showMessage("❌ Error submitting: " + err.message, "error");
  }
};


  // ✅ Show message (with fade effect)
  function showMessage(text, type = "success", duration = 3000) {
  const msg = document.getElementById("msg");
  if (!msg) return;

  msg.textContent = text;
  msg.style.background =
    type === "error" ? "#fbd3d3" : "#d1f5d3";
  msg.style.color = type === "error" ? "#7a1111" : "#065f28";
  msg.style.border = `2px solid ${
    type === "error" ? "#b91c1c" : "#1a8f3a"
  }`;

  msg.style.display = "block";
  msg.style.opacity = "1";

  setTimeout(() => (msg.style.opacity = "0"), duration - 800);
  setTimeout(() => (msg.style.display = "none"), duration);
}




  // ✅ Add another batch — restart camera
  addAnother.onclick = () => {
    afterSubmit.style.display = "none";
    formSection.style.display = "block";
    imageBase64 = null;
    preview.style.display = "none";
    startCamera();
    showMessage("Camera ready for new batch", "success", 2500);
  };

  // ✅ Logout
  logoutTop.onclick = () => {
    alert("Logged out successfully!");
    window.location.href = "index.html";
  };
});
