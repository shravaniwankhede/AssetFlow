# AssetFlow - Enterprise Asset & Resource Management System

## Overview

AssetFlow is a centralized Enterprise Asset & Resource Management System designed to help organizations efficiently manage physical assets and shared resources. The platform eliminates manual spreadsheets and paper-based tracking by providing a secure, role-based system for asset lifecycle management, resource booking, maintenance workflows, audits, and operational analytics.

Built as part of a hackathon, AssetFlow focuses on creating a scalable ERP-style application that can be adopted by organizations such as educational institutions, hospitals, offices, manufacturing companies, and government agencies.

---

## Problem Statement

Organizations often struggle with:

- Manual asset tracking using spreadsheets
- Double allocation of assets
- Resource booking conflicts
- Lack of maintenance workflows
- Poor audit management
- No centralized operational dashboard

AssetFlow addresses these challenges through a modern web-based ERP platform with automated workflows and role-based access control.

---

# Features

## Authentication & Authorization

- Secure Login & Registration
- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected Routes
- Password Hashing

---

## Organization Management

- Department Management
- Employee Directory
- Asset Category Management
- Role Assignment
- Department Hierarchy

---

## Asset Management

- Asset Registration
- QR/Asset Tag Generation
- Asset Status Tracking
- Asset Lifecycle Management
- Asset History
- Asset Search & Filtering

### Asset Status

- Available
- Allocated
- Reserved
- Under Maintenance
- Lost
- Retired
- Disposed

---

## Asset Allocation

- Allocate Assets
- Transfer Requests
- Return Requests
- Conflict Detection
- Allocation History
- Overdue Return Tracking

---

## Resource Booking

- Shared Resource Booking
- Calendar View
- Booking Validation
- Conflict Detection
- Booking Status Tracking
- Booking Reminders

---

## Maintenance Management

- Raise Maintenance Requests
- Approval Workflow
- Technician Assignment
- Progress Tracking
- Maintenance History

### Workflow

Pending
↓
Approved
↓
Technician Assigned
↓
In Progress
↓
Resolved

---

## Asset Audit

- Audit Cycle Creation
- Auditor Assignment
- Verification Process
- Discrepancy Reports
- Audit History

---

## Reports & Analytics

- Asset Utilization
- Department-wise Allocation
- Maintenance Analytics
- Booking Heatmaps
- Dashboard KPIs
- Exportable Reports

---

## Notifications

- Asset Assigned
- Transfer Approved
- Maintenance Updates
- Booking Reminders
- Audit Notifications
- Overdue Alerts

---

# User Roles

## Admin

- Manage Departments
- Manage Employees
- Assign Roles
- Create Categories
- View Organization Analytics

## Asset Manager

- Register Assets
- Allocate Assets
- Approve Transfers
- Approve Maintenance
- Manage Returns

## Department Head

- View Department Assets
- Approve Department Requests
- Book Shared Resources

## Employee

- View Assigned Assets
- Book Resources
- Raise Maintenance Requests
- Initiate Transfer Requests
- Request Asset Returns

---

# Tech Stack

## Frontend

- React.js
- Tailwind CSS
- React Router
- Axios

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- Bcrypt.js

## Database

- PostgreSQL

## Tools

- Prisma Studio
- Postman
- Git
- GitHub
- VS Code

---

# Project Architecture

```text
React Client
      │
      ▼
REST API
      │
      ▼
Node.js + Express
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

---

# Database Modules

- Users
- Departments
- Categories
- Assets
- Asset Allocations
- Transfer Requests
- Resource Bookings
- Maintenance Requests
- Audit Cycles
- Notifications
- Activity Logs

---

# Folder Structure

```text
AssetFlow/

├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── utils/
│
├── server/
│   ├── prisma/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── README.md
└── package.json
```

---

# Core Workflows

## Asset Allocation

```text
Register Asset
      ↓
Available
      ↓
Allocate
      ↓
Allocated
      ↓
Return
      ↓
Available
```

## Maintenance Workflow

Employee Raises Request
          ↓
      Pending
          ↓
 Manager Approval
          ↓
 Technician Assigned
          ↓
    In Progress
          ↓
      Resolved
          ↓
Asset Available Again

## Resource Booking

Select Resource
        ↓
Check Availability
        ↓
No Conflict
        ↓
Booking Confirmed
        ↓
Notification Sent

---

# Security Features

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Protected Routes
- Input Validation
- SQL Injection Protection (Prisma)
- Centralized Error Handling

---

# Future Enhancements

- QR Code Scanner
- Barcode Integration
- RFID Support
- Email Notifications
- SMS Alerts
- AI-based Predictive Maintenance
- Asset Demand Forecasting
- Mobile Application
- Multi-Organization Support

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/assetflow.git

cd assetflow
```

## Install Backend

```bash
cd server
npm install
```

## Install Frontend

```bash
cd client
npm install
```

## Configure Environment Variables

Create a `.env` file inside the server directory.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/assetflow"

JWT_SECRET=your_jwt_secret

PORT=5000
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Run Database Migration

```bash
npx prisma migrate dev --name init
```

## Start Backend

```bash
npm run dev
```

## Start Frontend

```bash
npm run dev
```

---

# API Modules

- Authentication
- Departments
- Employees
- Categories
- Assets
- Asset Allocation
- Transfer Requests
- Resource Booking
- Maintenance
- Audit
- Notifications
- Dashboard
- Reports

---

# Team Responsibilities

| Member | Responsibility |
|----------|----------------|
| Frontend Developer | React UI, Components, API Integration |
| Backend Developer | PostgreSQL, Prisma, Authentication, APIs, Business Logic |

---

# Future Scope

- AI-powered Asset Recommendation
- Predictive Maintenance
- QR Code & Barcode Scanning
- Mobile Application
- Cloud Storage Integration
- Multi-Tenant Architecture
- Real-time Notifications using WebSockets
- Analytics Dashboard with Charts

---

# License

This project was developed for educational and hackathon purposes.
