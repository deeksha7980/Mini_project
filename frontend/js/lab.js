(async () => {
  const LAB_NAME = "LabTech01";
  document.getElementById("labName").textContent = LAB_NAME;

  const listArea = document.getElementById("listArea");
  const emptyEl = document.getElementById("empty");

  const filterApproved = document.getElementById("filterApproved");
  const filterPending = document.getElementById("filterPending");
  const filterRejected = document.getElementById("filterRejected");

  const logoutBtn = document.getElementById("logoutBtn");

  let allHerbs = [];
  let currentFilter = "pending";

  // Auto-detect backend
  const API_BASE = window.location.hostname.includes("loclx.io")
    ? window.location.origin.replace("/frontend", "")
    : "http://localhost:5000";

  async function fetchHerbs() {
    try {
      const res = await fetch(`${API_BASE}/api/farmers-local?nocache=${Date.now()}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("fetchHerbs error:", err);
      return [];
    }
  }

  // ⭐ FIXED: Sends decision = "approved" or "rejected"
  async function sendDecision(entry, remarks, decision) {
    try {
      const payload = {
        herbId: entry.herbId,
        labName: LAB_NAME,
        certificate: remarks || (decision === "rejected"
          ? "Rejected due to quality standards not met."
          : "Approved for quality assurance."),
        decision: decision,  // ⭐ important
      };

      const res = await fetch(`${API_BASE}/api/lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      // update local object
      entry.status = decision;

      render();
    } catch (err) {
      console.error("❌ Error saving lab data:", err);
      alert("Could not save data: " + err.message);
    }
  }

  function render() {
    listArea.innerHTML = "";

    const herbs = allHerbs.filter(h =>
      currentFilter === "approved"
        ? h.status === "approved"
        : currentFilter === "rejected"
        ? h.status === "rejected"
        : h.status === "pending"
    );

    if (!herbs.length) {
      emptyEl.style.display = "block";
      emptyEl.textContent =
        currentFilter === "approved"
          ? "No approved herbs yet."
          : currentFilter === "rejected"
          ? "No rejected herbs yet."
          : "No pending herbs.";
      return;
    }

    emptyEl.style.display = "none";

    herbs.forEach(entry => {
      const card = document.createElement("div");
      card.className = "card";

      const imgSrc = entry.photoUrl?.startsWith("http")
        ? entry.photoUrl
        : `${API_BASE}${entry.photoUrl}`;

      card.innerHTML = `
        <img class="thumb" src="${imgSrc}" alt="${entry.herbName}" />
        <div class="meta">
          <h4>${entry.herbName} <span style="color:#888;">(${entry.herbId})</span></h4>
          <p><strong>Farmer:</strong> ${entry.farmerName}</p>
          <p><strong>Location:</strong> ${(entry.latitude || "") + (entry.longitude ? ", " + entry.longitude : "")}</p>
        </div>
      `;

      const controls = document.createElement("div");
      controls.className = "controls";

      if (entry.status === "pending") {
        const remarks = document.createElement("textarea");
        remarks.placeholder = "Enter remarks...";

        const approve = document.createElement("button");
        approve.className = "approve";
        approve.textContent = "Approve";
        approve.onclick = () => sendDecision(entry, remarks.value, "approved");

        const reject = document.createElement("button");
        reject.className = "reject";
        reject.textContent = "Reject";
        reject.onclick = () => sendDecision(entry, remarks.value, "rejected");

        card.appendChild(remarks);
        controls.appendChild(approve);
        controls.appendChild(reject);
      } else {
        const tag = document.createElement("div");
        tag.textContent = entry.status === "approved" ? "✅ Approved" : "❌ Rejected";
        tag.style = `
          margin-top:10px;
          padding:8px;
          text-align:center;
          border-radius:8px;
          background:${entry.status === "approved" ? "#d4edda" : "#f8d7da"};
          color:${entry.status === "approved" ? "#155724" : "#721c24"};
          font-weight:600;`;
        card.appendChild(tag);
      }

      card.appendChild(controls);
      listArea.appendChild(card);
    });
  }

  // Filtering buttons
  filterApproved.onclick = () => { currentFilter = "approved"; render(); };
  filterPending.onclick = () => { currentFilter = "pending"; render(); };
  filterRejected.onclick = () => { currentFilter = "rejected"; render(); };
  logoutBtn.onclick = () => (window.location.href = "index.html");

  allHerbs = await fetchHerbs();
  render();
})();
