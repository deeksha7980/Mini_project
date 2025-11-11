(async () => {
  const listArea = document.getElementById("herbList");
  const emptyMsg = document.getElementById("empty");
  const logoutBtn = document.getElementById("logoutBtn");

  const PUBLIC_URL = "https://ysammmqwxp.loclx.io";

  async function fetchApprovedHerbs() {
    const res = await fetch(`${PUBLIC_URL}/api/approved-herbs`);
    const data = await res.json();
    return data.filter(h => h.status === "approved");
  }

  async function render() {
    const herbs = await fetchApprovedHerbs();
    listArea.innerHTML = "";
    if (!herbs.length) {
      emptyMsg.style.display = "block";
      emptyMsg.textContent = "No approved herbs yet.";
      return;
    }
    emptyMsg.style.display = "none";
    herbs.forEach((h, i) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${h.photoUrl}" alt="${h.herbName}" />
        <div class="details">
          <p><b>${h.herbName}</b></p>
          <p><b>Farmer:</b> ${h.farmerName}</p>
          <p><b>Batch ID:</b> ${h.herbId}</p>
          <p><b>Verified By:</b> ${h.labName || "Lab"}</p>
          <p><b>Certificate:</b> ${h.certificate || "—"}</p>
        </div>
        <div class="qr-section" id="qr-${i}"></div>
        <button onclick="downloadQR(${i}, '${h.herbName}')">📥 Download QR</button>
      `;
      listArea.appendChild(card);
      new QRCode(document.getElementById(`qr-${i}`), {
        text: `${PUBLIC_URL}/frontend/consumer.html?batch=${herb.herbId}`,
        width: 120,
        height: 120,
      });
    });
  }

  logoutBtn.onclick = () => {
    alert("Logged out successfully!");
    window.location.href = "index.html";
  };

  window.downloadQR = (i, name) => {
    const canvas = document.querySelector(`#qr-${i} canvas`);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${name}_QR.png`;
    a.click();
  };

  render();
})();



