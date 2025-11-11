const user = JSON.parse(localStorage.getItem("ayurtrace_loggedin_user"));
if (!user || user.role !== "consumer") window.location.href = "index.html";
document.getElementById("username").textContent = user.username;

async function fetchValue() {
  const res = await fetch("/api/farmers-local"); // or "/api/approved-herbs" depending on what you want
  const data = await res.json();
  document.getElementById("value").textContent = Array.isArray(data) ? data.length : JSON.stringify(data);

}

function logout() {
  localStorage.removeItem("ayurtrace_loggedin_user");
  window.location.href = "index.html";
}

fetchValue();
