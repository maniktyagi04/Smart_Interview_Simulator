# SIS – Smart Interview Simulator

SIS is a production-grade interview simulation system designed for high-stakes interview preparation. It features a rule-based evaluation engine, session state persistence, and a modern, professional UI.

## 🚀 Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** & **Tailwind CSS v4**
- **React Router** for navigation
- **Lucide React** for iconography
- **Context API** for global state management

### Backend
- **Node.js** & **Express.js**
- **TypeScript**
- **Prisma ORM** (v7)
- **MySQL** Database
- **JWT** Authentication with RBAC

## 🛠 Features
- **Smart Session Engine**: Interviews managed as a state machine.
- **Evaluation Pipeline**: Modular scoring logic (Keyword coverage, Concept match, Clarity).
- **Admin Dashboard**: Comprehensive question bank management and system analytics.
- **Student Dashboard**: Performance tracking and session configuration.
- **Mobile Responsive**: Clean, interview-style UI optimized for all devices.

## 📦 Getting Started

### Prerequisites
- Node.js >= 18
- MySQL Server

### Backend Setup
1. Navigate to `/backend`
2. `npm install`
3. Configure `.env` with your `DATABASE_URL`
4. `npx prisma generate`
5. `npm run dev`

### Frontend Setup
1. Navigate to `/frontend`
2. `npm install`
3. `npm run dev`

## 🏗 System Architecture
The project follows a clean architecture separation:
- **Presentation**: React Hooks & Components.
- **API**: Express Controllers & Routes.
- **Logic**: Service layer for Evaluation & Session management.
- **Persistence**: Prisma Repositories & MySQL.

---
*Developed for excellence in software engineering roles.*
