🌿 AyurTrace — Blockchain-Integrated Herb Traceability System
🧾 Overview

AyurTrace (HerbChain) is a blockchain-integrated traceability web application that enables the tracking of Ayurvedic herbs from farm to shelf.
Each herb batch is added by a Farmer, verified by a Lab, processed by a Manufacturer, and finally viewed by Consumers using a QR code.

The system ensures transparency, authenticity, and trust in Ayurvedic herb supply chains.

🗂️ Folder Structure
D:\SIH\SIH2\AyurTrace\frontend
│
├── css/
│   └── styles.css                     # Shared styling (login/home pages)
│
├── imgs/
│   ├── farmer.png                     # Background for farmer portal
│   ├── lab.png                        # Background for lab portal
│   ├── manufacturer.png               # Background for manufacturer portal
│   ├── consumer.png                   # Background for consumer portal
│   ├── approved_badge.jpg             # Used on certificate PDFs
│   └── placeholder.png                # Default herb image
│
├── js/
│   ├── farmer.js                      # Farmer portal logic
│   ├── lab.js                         # Lab verification logic
│   ├── manufacturer.js                # Manufacturer QR generation
│   └── consumer.js                    # Consumer data fetching (if separate)
│
├── index.html                         # Login / Signup page
├── home.html                          # Welcome homepage
├── farmer.html                        # Farmer dashboard
├── lab.html                           # Lab dashboard
├── manufacturer.html                  # Manufacturer dashboard
└── consumer.html                      # Consumer QR portal

⚙️ Backend Setup
Prerequisites

Node.js (>=18)

npm or yarn

VS Code preferred for editing

MongoDB or JSON file storage (currently uses data.json local file)

Server file: server.js (or index.js)

Install Dependencies
npm install

Run Backend Server
node server.js


The server runs on http://localhost:5000/
 by default.

💻 Frontend Setup
Option 1 — Live Server in VS Code

Right-click on any HTML file → Open with Live Server

The default path:

http://127.0.0.1:5500/frontend/

Option 2 — Manual Browser Load

Open any HTML file directly via file explorer:

frontend/index.html

🔑 Login System

The Homepage (home.html) shows:

“Welcome to HerbChain”

A “Login” button (redirects to index.html)

A “What is Blockchain?” button (links to a YouTube short)

The Login / Signup Page (index.html) supports:

Roles: 👨‍🌾 Farmer, 🧪 Lab, 🏭 Manufacturer

Local storage authentication (username & password)

Redirects to respective dashboards after sign-in

🌾 Farmer Portal (farmer.html)
Features

Capture herb photo via webcam 📸 or upload locally 🖼️

Auto-fetch GPS coordinates 🌍

Submit new herb batches

View your herb list with live status (Pending / Approved / Rejected)

Status Indicators
Status	Color	Meaning
🟡 Pending	Yellow	Waiting for Lab verification
✅ Approved	Green	Passed lab quality check
❌ Rejected	Red	Failed lab test
API Endpoints Used

POST /api/farmer → Submit new herb

GET /api/farmers-local → Load all herbs

🧪 Lab Portal (lab.html)
Features

Displays all pending herbs added by farmers

Allows lab technician to Approve or Reject herbs

Generates PDF Certificates using jsPDF

Displays Approved ✅ or Rejected ❌ tags clearly

Auto-refreshes every 10 seconds for real-time updates

Actions
Button	Function
✅ Approve	Adds certificate, marks status as “approved”, generates PDF
❌ Reject	Marks herb as “rejected” in backend
🔄 Refresh	Reloads herb list from backend
API Endpoint

POST /api/lab → Updates herb status & stores certificate info

🏭 Manufacturer Portal (manufacturer.html)
Features

Displays only Approved Herbs

Each herb card includes:

Herb photo

Batch ID

Farmer name

Certificate ID

Lab verifier name

Automatically generates QR Code for each approved herb

QR leads directly to consumer.html?batch=HERB_ID

Library Used

QRCode.js (client-side QR generation)

API Endpoint

GET /api/farmers-local

🧍‍♀️ Consumer Portal (consumer.html)
Features

Scans a QR Code (redirects to consumer page with batch parameter)

Displays verified herb details:

Herb name, farmer, lab, certificate

Herb photo and certificate (if uploaded)

Prevents reload bugs (always refreshes with correct batch data)

Beautiful transparent background using consumer.png

API Endpoint

GET /api/farmers-local

QR Code Format
https://<your-tunnel-link>/frontend/consumer.html?batch=<HERB_ID>

🧾 Certificate PDF (Lab Portal)

Generated using jsPDF:

Landscape A4 layout

Herbal details, remarks, and timestamp

Lab name, signature section

Herb photo embedded

Gold border with green highlights

AyurTrace watermark and “Approved” seal image

Saved locally as:

<HERB_ID>_Certificate.pdf

🔄 Data Synchronization Flow
Action	Updates	Reflected In
Farmer adds herb	status: pending	Farmer Portal
Lab approves herb	status: approved	Farmer, Manufacturer, Consumer
Lab rejects herb	status: rejected	Farmer (red “Rejected”)
Manufacturer fetches herbs	Only approved herbs	Manufacturer Portal
Consumer scans QR	Shows approved herb details	Consumer Portal
🧱 Backend Route Summary
Route	Method	Description
/api/farmer	POST	Add new herb entry
/api/farmers-local	GET	Retrieve all stored herbs
/api/lab	POST	Update status (approved / rejected) and certificate
📸 Adding Images

Each portal uses background images stored in frontend/imgs/:

Portal	Image
Home / Index	background.png (optional)
Farmer	farmer.png
Lab	lab.png
Manufacturer	manufacturer.png
Consumer	consumer.png

Add them to your /frontend/imgs/ folder before running the project.

🧩 Technologies Used
Stack	Description
Frontend	HTML5, CSS3, JavaScript (Vanilla)
Backend	Node.js + Express.js
Database	Local JSON File (data.json)
Blockchain (optional)	Ethereum Smart Contract (for future integration)
PDF Library	jsPDF
QR Generation	qrcodejs
🧠 Future Enhancements

🔗 Integrate smart contract to record approvals on-chain

🔐 Add login authentication using JWT

🪶 Improve dashboard analytics for herb flow

📱 Progressive Web App (PWA) support

🚀 Quick Start Summary

1️⃣ Run backend

node server.js


2️⃣ Launch frontend

Open home.html in browser or Live Server.

3️⃣ Test login:

Farmer → Add new herb

Lab → Approve or Reject herb

Manufacturer → Generate QR

Consumer → Scan QR to verify

🧑‍💻 Developer Notes

Never modify logic blocks unless necessary.

Always keep "status" values as:

"pending"

"approved"

"rejected"

All data persistence is through safeWriteJson(DATA_FILE) in the backend.

To reset system → delete data.json.

📜 License

This project is developed for Smart India Hackathon (SIH) demonstration purposes.
All rights reserved © 2025 AyurTrace Team.
