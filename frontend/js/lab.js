// lab.js — Updated for Approve + Reject Functionality
(async () => {
  const LAB_NAME = "LabTech01";
  document.getElementById("labName").textContent = LAB_NAME;

  const listArea = document.getElementById("listArea");
  const emptyEl = document.getElementById("empty");
  const filterApproved = document.getElementById("filterApproved");
  const filterPending = document.getElementById("filterPending");
  const logoutBtn = document.getElementById("logoutBtn");

  let allHerbs = [];
  let currentFilter = "pending";

  // ✅ Fetch herbs
  async function fetchHerbs() {
    try {
      const res = await fetch("http://localhost:5000/api/farmers-local");
      if (!res.ok) throw new Error("Failed to fetch herbs");
      const data = await res.json();
      return data.map((h) => ({
        ...h,
        approved: h.status === "approved" || !!h.labName,
        rejected: h.status === "rejected",
      }));
    } catch (err) {
      console.error("fetchHerbs error:", err);
      return [];
    }
  }

  // ✅ Save lab decision (approve / reject)
  async function saveLabData(entry, remarks, status) {
    try {
      const payload = {
        herbId: entry.herbId,
        herbName: entry.herbName,
        labName: LAB_NAME,
        certificate:
          status === "approved"
            ? remarks || "Approved for quality assurance."
            : "Rejected by lab verification.",
        status: status,
        timestamp: new Date().toLocaleString(),
      };

      const res = await fetch("http://localhost:5000/api/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      if (status === "approved") {
        entry.approved = true;
        entry.rejected = false;
        entry.status = "approved";
      } else {
        entry.rejected = true;
        entry.approved = false;
        entry.status = "rejected";
      }

      render();
    } catch (err) {
      console.error("❌ Error saving lab data:", err);
      alert("Could not save lab data: " + err.message);
    }
  }

  // ✅ Generate a styled certificate PDF
  async function generateCertificatePDF(entry, remarks, labName) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("landscape", "pt", "a4");

      // Background & border
      doc.setFillColor(255, 255, 245);
      doc.rect(0, 0, 842, 595, "F");
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(6);
      doc.rect(20, 20, 802, 555);

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(34);
      doc.setTextColor(44, 88, 56);
      doc.text("Certificate of Analysis", 421, 100, { align: "center" });

      // Subtitle
      doc.setFont("times", "italic");
      doc.setFontSize(18);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "Issued under AyurTrace Quality Assurance Program",
        421,
        130,
        { align: "center" }
      );

      // Herb details
      doc.setFont("times", "normal");
      doc.setFontSize(16);
      const yStart = 190;
      const leftCol = 120;
      const lineGap = 34;

      doc.text(`Herb Name: ${entry.herbName || "—"}`, leftCol, yStart);
      doc.text(`Farmer Name: ${entry.farmerName || "—"}`, leftCol, yStart + lineGap);
      doc.text(`Batch ID: ${entry.herbId || "—"}`, leftCol, yStart + lineGap * 2);
      doc.text(
        `Geolocation: ${entry.latitude || entry.coordinates || "N/A"}`,
        leftCol,
        yStart + lineGap * 3
      );
      doc.text(`Tested By: ${labName}`, leftCol, yStart + lineGap * 4);
      doc.text(`Date: ${new Date().toLocaleString()}`, leftCol, yStart + lineGap * 5);

      // Remarks
      doc.setFont("times", "italic");
      doc.setFontSize(14);
      doc.text("Remarks:", leftCol, yStart + lineGap * 7);
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.text(
        remarks || "The herb sample meets AyurTrace quality standards.",
        leftCol,
        yStart + lineGap * 8,
        { maxWidth: 400 }
      );

      // Herb image
      if (entry.photoUrl) {
        const img = await loadImage(entry.photoUrl);
        doc.addImage(img, "JPEG", 580, 180, 200, 180);
        doc.setFontSize(12);
        doc.text("Herb Sample", 680, 380, { align: "center" });
      }

      // Authorized Signature
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.text("Authorized Signature", 650, 530);

      // Approved seal
      try {
        const sealPath = "imgs/approved_badge.jpg";
        const sealImg = await loadImage(sealPath);
        doc.addImage(sealImg, "JPEG", 40, 40, 100, 100);
      } catch (err) {
        console.warn("⚠️ Seal image not found:", err);
      }

      // Footer
      doc.setFontSize(10);
      doc.text(
        "© AyurTrace Certification | Blockchain-integrated Quality Tracking",
        421,
        565,
        { align: "center" }
      );

      doc.save(`${entry.herbId}_Certificate.pdf`);
    } catch (err) {
      console.error("generateCertificatePDF error:", err);
      alert("Error generating certificate: " + err.message);
    }
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image: " + url));
      img.src = url;
    });
  }

  // ✅ Render UI (Pending / Approved)
  function render() {
    listArea.innerHTML = "";

    const herbs = allHerbs.filter((h) =>
      currentFilter === "approved"
        ? h.status === "approved"
        : h.status !== "approved" && h.status !== "rejected"
    );

    if (!herbs.length) {
      emptyEl.style.display = "block";
      emptyEl.textContent =
        currentFilter === "approved"
          ? "No approved herbs yet."
          : "No pending herbs.";
      return;
    }

    emptyEl.style.display = "none";

    herbs.forEach((entry) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img class="thumb" src="${entry.photoUrl || "imgs/placeholder.png"}" alt="${entry.herbName}" />
        <div class="meta">
          <h4>${entry.herbName} <span style="color:#888;">(${entry.herbId})</span></h4>
          <p><strong>Farmer:</strong> ${entry.farmerName || "—"}</p>
          <p><strong>Coordinates:</strong> ${
            entry.latitude || entry.coordinates || "N/A"
          }</p>
          <p><strong>Status:</strong> ${
            entry.status === "approved"
              ? "<span style='color:#146c43;font-weight:bold;'>Approved</span>"
              : entry.status === "rejected"
              ? "<span style='color:#c9302c;font-weight:bold;'>Rejected</span>"
              : "<span style='color:#856404;font-weight:bold;'>Pending</span>"
          }</p>
        </div>
      `;

      const controls = document.createElement("div");
      controls.className = "controls";

      if (entry.status === "approved") {
        const downloadBtn = document.createElement("button");
        downloadBtn.className = "download";
        downloadBtn.textContent = "Download Certificate";
        downloadBtn.onclick = () =>
          generateCertificatePDF(
            entry,
            entry.certificate || "Approved for quality assurance.",
            LAB_NAME
          );
        controls.appendChild(downloadBtn);
      } else if (entry.status === "rejected") {
        const rejectedTag = document.createElement("div");
        rejectedTag.style.cssText =
          "background:#f8d7da;color:#721c24;font-weight:600;padding:10px;text-align:center;border-radius:8px;margin-top:10px;";
        rejectedTag.textContent = "❌ Rejected by Lab";
        card.appendChild(rejectedTag);
      } else {
        const remarks = document.createElement("textarea");
        remarks.placeholder = "Enter lab remarks / certificate info";
        card.appendChild(remarks);

        const approveBtn = document.createElement("button");
        approveBtn.className = "approve";
        approveBtn.textContent = "Approve";
        approveBtn.onclick = () => saveLabData(entry, remarks.value, "approved");

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "reject";
        rejectBtn.textContent = "Reject";
        rejectBtn.onclick = () => saveLabData(entry, remarks.value, "rejected");

        controls.appendChild(approveBtn);
        controls.appendChild(rejectBtn);
      }

      card.appendChild(controls);
      listArea.appendChild(card);
    });
  }

  // ✅ Filters
  filterApproved.onclick = () => {
    currentFilter = "approved";
    filterApproved.classList.add("active");
    filterPending.classList.remove("active");
    render();
  };

  filterPending.onclick = () => {
    currentFilter = "pending";
    filterPending.classList.add("active");
    filterApproved.classList.remove("active");
    render();
  };

  logoutBtn.onclick = () => (window.location.href = "index.html");

  // ✅ Initialize
  allHerbs = await fetchHerbs();
  render();

  // 🔁 Auto-refresh
  setInterval(async () => {
    allHerbs = await fetchHerbs();
    render();
  }, 10000);
})();
