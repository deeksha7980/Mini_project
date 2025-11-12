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

  async function fetchHerbs() {
    try {
      const res = await fetch("http://localhost:5000/api/farmers-local?nocache=" + Date.now());
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("fetchHerbs error:", err);
      return [];
    }
  }

  async function saveLabData(entry, remarks, isRejected = false) {
    try {
      const payload = {
        herbId: entry.herbId,
        herbName: entry.herbName,
        labName: LAB_NAME,
        certificate: remarks || (isRejected ? "Rejected due to quality failure." : "Approved for quality assurance."),
        timestamp: new Date().toLocaleString(),
        status: isRejected ? "rejected" : "approved",
      };

      const res = await fetch("http://localhost:5000/api/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      entry.status = isRejected ? "rejected" : "approved";
      render();
    } catch (err) {
      console.error("❌ Error saving lab data:", err);
      alert("Could not save data: " + err.message);
    }
  }

  function render() {
    listArea.innerHTML = "";
    const herbs = allHerbs.filter(h =>
      currentFilter === "approved" ? h.status === "approved" :
      currentFilter === "rejected" ? h.status === "rejected" :
      h.status === "pending"
    );

    if (!herbs.length) {
      emptyEl.style.display = "block";
      emptyEl.textContent =
        currentFilter === "approved" ? "No approved herbs yet." :
        currentFilter === "rejected" ? "No rejected herbs yet." :
        "No pending herbs.";
      return;
    }

    emptyEl.style.display = "none";
    herbs.forEach(entry => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img class="thumb" src="${entry.photoUrl || entry.image}" alt="${entry.herbName}" />
        <div class="meta">
          <h4>${entry.herbName} <span style="color:#888;">(${entry.herbId})</span></h4>
          <p><strong>Farmer:</strong> ${entry.farmerName}</p>
          <p><strong>Location:</strong> ${entry.location || "N/A"}</p>
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
        approve.onclick = () => saveLabData(entry, remarks.value);

        const reject = document.createElement("button");
        reject.className = "reject";
        reject.textContent = "Reject";
        reject.onclick = () => saveLabData(entry, remarks.value, true);

        card.appendChild(remarks);
        controls.appendChild(approve);
        controls.appendChild(reject);
      } else {
        const tag = document.createElement("div");
        tag.textContent = entry.status === "approved" ? "✅ Approved" : "❌ Rejected";
        tag.style = `margin-top:10px;padding:8px;text-align:center;border-radius:8px;
          background:${entry.status === "approved" ? "#d4edda" : "#f8d7da"};
          color:${entry.status === "approved" ? "#155724" : "#721c24"};
          font-weight:600;`;
        card.appendChild(tag);
      }

      card.appendChild(controls);
      listArea.appendChild(card);
    });
  }

  filterApproved.onclick = () => { currentFilter = "approved"; render(); };
  filterPending.onclick = () => { currentFilter = "pending"; render(); };
  filterRejected.onclick = () => { currentFilter = "rejected"; render(); };
  logoutBtn.onclick = () => (window.location.href = "index.html");

  allHerbs = await fetchHerbs();
  render();
})();