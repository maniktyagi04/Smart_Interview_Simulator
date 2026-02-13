# 🚀 SIS – Smart Interview Simulator

A production-grade interview simulation platform built for high-stakes technical preparation (DSA, System Design, CS Core).

SIS replicates real interview environments using a structured session engine, modular evaluation pipeline, and role-based dashboards for Students and Admins.

---

# 🖥 Product Preview

## 🎓 Student Dashboard

<img width="1280" height="666" alt="image" src="https://github.com/user-attachments/assets/fc5575e5-7477-43b4-865e-de9012d635da" />
<img width="1280" height="666" alt="image" src="https://github.com/user-attachments/assets/fc5575e5-7477-43b4-865e-de9012d635da" />


![Student Dashboard](./assets/student-dashboard.png)
![Interview Session](./assets/interview-session.png)
![Performance Analytics](./assets/performance-analytics.png)

---

## 🛡 Admin Dashboard

![Admin Analytics](./assets/admin-dashboard.png)
![Question Bank](./assets/question-bank.png)
![Interview Insights](./assets/interview-insights.png)

> Replace the image paths with your actual screenshots.

---

# 🎯 Problem Statement

Most interview preparation platforms:
- Provide static question lists
- Evaluate only code correctness
- Lack structured scoring logic
- Do not simulate real interview workflows

Serious candidates need:
- Structured interview sessions
- Technical + conceptual evaluation
- Performance analytics
- Admin-level control & oversight

SIS solves this gap with a state-driven interview engine and modular scoring pipeline.

---

# 🧠 Core System Design

## Interview Lifecycle (State Machine Driven)

Idle → Scheduled → Active → Evaluation → Feedback Delivered


Each interview session is persisted and managed as a deterministic state machine.

---

## Evaluation Pipeline

Modular scoring architecture:

- Keyword Coverage Scoring
- Concept Matching
- Clarity & Explanation Scoring
- Code Structure Assessment
- Weighted Score Aggregation

Evaluation logic is separated from controllers using a dedicated service layer.

---

# 🏗 Architecture Overview

## Layered Clean Architecture

Frontend (React 19 + TypeScript)
↓
Express API Layer
↓
Service Layer (Session Engine + Evaluation Logic)
↓
Prisma ORM
↓
MySQL Database


Authentication:
- JWT-based authentication
- Role-Based Access Control (RBAC)

Architecture ensures scalability, separation of concerns, and maintainability.

---

# ⚙️ Tech Stack

## Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Context API
- Lucide React

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM (v7)
- MySQL
- JWT Authentication
- RBAC Authorization

---

# ✨ Features

## 🎓 Student
- Interview configuration system
- Real-time session tracking
- AI-powered evaluation feedback
- Performance analytics dashboard
- Interview history tracking

## 🛡 Admin
- Dynamic question bank management
- Interview scheduling
- AI interview insight review
- Report generation system
- Student performance analytics
- Ban / Unban interview access

---

# 🚀 Engineering Highlights

- State-machine driven session engine
- Modular evaluation pipeline
- Clean layered architecture
- Repository pattern with Prisma
- Secure JWT + RBAC implementation
- Production-style folder structure
- Mobile responsive professional UI

---

# 📦 Local Setup

## Prerequisites
- Node.js >= 18
- MySQL Server

---

## Backend Setup

cd backend
npm install
npx prisma generate
npm run dev

---

## Frontend Setup

cd frontend
npm install
npm run dev

---

# 📌 Future Improvements

- Real LLM-powered evaluation integration
- Live video interview simulation
- WebSocket-based real-time monitoring
- Multi-organization support
- Advanced analytics with ML insights

---

# 📄 License

This project is built for educational and professional portfolio purposes.

---

# 👨‍💻 Author

Manik Tyagi  
Full-Stack Developer | System Design Enthusiast | Problem Solver

