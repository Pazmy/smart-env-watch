# Smart Environment Watch 🌱

Smart Environment Watch is a web-based reporting platform designed to help communities and local authorities tackle environmental issues, specifically illegal dumping and waste management. 

By combining community participation with Artificial Intelligence (Computer Vision), this system streamlines the reporting process, automatically classifies waste, and provides a transparent tracking system for the public.

## ✨ Key Features

### Public/User Facing
* **Easy Reporting:** Users can submit environmental issues by uploading a photo, providing a description, and automatically attaching their current GPS coordinates.
* **AI Auto-Detection:** The system uses an integrated AI model to instantly analyze the uploaded image. If it detects waste/trash, it automatically categorizes the report.
* **Ticket Tracking:** Upon submission, users receive a unique Ticket ID to track the real-time status of their report (e.g., Pending, In Progress, Resolved).

### Admin/Management Facing
* **Secure Dashboard:** Protected route for administrators to view and manage all incoming reports.
* **Hybrid Verification System:** If the AI is unsure about an image (low confidence), it flags the report as "Needs Verification," allowing admins to manually update the category (e.g., Flooding, Damaged Roads).
* **Interactive UI:** Features a collapsible sidebar, horizontal-scrolling data tables, and an Image Preview Modal for detailed inspection of evidence.
* **Direct Map Integration:** Admin can click on GPS coordinates to instantly open Google Maps for accurate field surveying.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling & Responsive UI)
* Lucide React (Icons)

**Backend:**
* Node.js & Express.js
* Mongoose (ODM)

**Database & Cloud Services:**
* MongoDB Atlas (Database)
* Cloudinary (Image Storage & Management)
* Roboflow API (Object Detection / Computer Vision)

## 🚀 Local Setup & Installation

Follow these steps to run the project locally on your machine.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* A [MongoDB](https://www.mongodb.com/) account/URI
* A [Cloudinary](https://cloudinary.com/) account
* A [Roboflow](https://roboflow.com/) account & API Key

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/smart-env-watch.git](https://github.com/yourusername/smart-env-watch.git)
cd smart-env-watch
```
### 2. Backend Setup
```Bash

cd server
npm install
```
Create a .env file in the server directory and add the following variables:
Cuplikan kode
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Roboflow Config
ROBOFLOW_MODEL_ID=your_model_id (e.g., trashscan-xxxxx)
ROBOFLOW_VERSION=your_model_version (e.g., 2)
ROBOFLOW_API_KEY=your_roboflow_private_api_key

Start the backend server:
```Bash

npm run dev
```
### 3. Frontend Setup

Open a new terminal window/tab.
```bash
cd client
npm install
```
(Optional) If your backend is hosted elsewhere, create a .env file in the client directory:
```bash
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

💻 Usage & Workflow

1. Submit a Report: Open http://localhost:5173, upload a photo of garbage, and submit.
2. Check AI Result: The success page will show the AI's prediction.
3. Admin Login: Navigate to /admin/login. (Default credentials setup in the controller: admin / admin123).
4. Manage: View the report, open the image modal, click the map link, and change the status to "Resolved".

🎓 Academic Context

This project was developed as part of the "Information Technology Design and Development Project" course at Universitas Siber Asia (UNSIA). It demonstrates the practical implementation of the MERN stack integrated with external AI APIs.
