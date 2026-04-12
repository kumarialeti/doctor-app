# MediCarePro - Full-Stack Healthcare Platform

MediCarePro is a premium, enterprise-grade telehealthcare and doctor-booking web application. Built on the MERN stack with highly dynamic isometric UIs, WebSockets, and integrated Video Conferencing, it bridges the gap between doctors and patients securely.

## 🚀 Key Features

### 1. Role-Based Dynamic Dashboards
The application securely manages 3 distinct user roles, each with their own isolated interfaces:
- **Patients:** Can browse doctors, check dynamic availability calendars, upload medical documents, leave 5-star reviews, and book appointments.
- **Doctors:** Dedicated "Doctor Dashboards" to approve appointments, mark consultations complete (attaching prescriptions/notes), and manage their clinical profiles.
- **Admins:** Centralized analytics dashboard with interactive Recharts graphics to manipulate user roles, monitor platform usage, and oversee systemic appointments.

### 2. Live Telemedicine Encounters
- Embedded **Jitsi Meet APIs** allow doctors to initiate a live Video & Audio consultation directly within the platform.
- Patients and doctors seamlessly join secure virtual rooms with a single click without leaving the application.

### 3. Real-Time Encrypted Messaging (Socket.io)
- Real-time TCP WebSocket integration via `Socket.io` allows patients and doctors to message each other instantly.
- Features real-time "Online" typing indicators and encrypted data transit directly managed by the Node server.

### 4. Advanced Authentication & Recovery
- Secure JWT-based middleware tracking sessions securely.
- **Cryptographic "Forgot Password" Flow:** Leverages Nodemailer and Google App Passwords to automatically send secure 6-digit OTP passcodes to user emails with strict 15-minute expiration protocols stored in MongoDB.

### 5. Beautiful & Modern Design System
- Built heavily utilizing `Tailwind CSS`, `Framer Motion`, and `Ant Design` components.
- Glassmorphic accents, complex layout routing, interactive hovering, toast notifications, isometric SVGs, and responsive mobile architecture.

## 💻 Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS, Ant Design, Framer Motion, Socket.io-client, Axios, Jitsi-React-SDK, Recharts.
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, Nodemailer, Bcrypt, JWT.

## 🛠️ How to Run Locally

1. Create a `.env` in the `backend` folder containing your `MONGO_URI`, `JWT_SECRET`, `SMTP_USER` (gmail), `SMTP_PASS` (16-char app password).
2. Open terminal and run `npm install` in both `/frontend` and `/backend`.
3. In the root, run `npm run dev` to start both the Vite Frontend and Node Backend concurrently.
